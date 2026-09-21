import test from 'node:test';
import assert from 'node:assert/strict';
import { Workflow } from './workflow.mjs';
import { SyntheticProvider } from './provider.mjs';
import { request, scenarios } from './fixtures.mjs';

function setup(outcomes) {
  const provider = new SyntheticProvider(outcomes);
  return { provider, workflow: new Workflow(provider) };
}

test('A1: duplicate delivery creates one ticket and returns the same confirmation', async () => {
  const { provider, workflow } = setup(scenarios.success);
  const first = await workflow.submit(request);
  assert.equal(first.state, 'confirmed');
  assert.deepEqual(await workflow.submit(request), first);
  assert.equal(provider.calls, 1);
  assert.equal(provider.effects, 1);
});

test('A2: concurrent delivery is claimed before awaiting the provider', async () => {
  const provider = new SyntheticProvider();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0;
  let reads = 0;
  const workflow = new Workflow({ create: async input => { calls++; await gate; return provider.create(input); },
    lookup: async key => { reads++; return provider.lookup(key); } });
  const pending = workflow.submit(request);
  const duplicate = await workflow.submit(request);
  assert.equal(duplicate.state, 'attempted');
  assert.equal(duplicate.ticketId, null);
  assert.equal((await workflow.reconcile(request.key)).state, 'attempted');
  assert.equal(reads, 0);
  assert.equal(calls, 1);
  release();
  assert.equal((await pending).state, 'confirmed');
  assert.equal(provider.effects, 1);
});

test('A3: reused key with changed payload is rejected without a second call', async () => {
  const { provider, workflow } = setup(scenarios.success);
  await workflow.submit(request);
  await assert.rejects(workflow.submit({ ...request, quantity: 3 }), /payload conflict/);
  assert.equal(provider.calls, 1);
  assert.equal(provider.effects, 1);
});

test('A4: proven pre-effect busy retries once and can succeed', async () => {
  const { provider, workflow } = setup(scenarios.transient);
  assert.equal((await workflow.submit(request)).state, 'confirmed');
  assert.equal(provider.calls, 2);
  assert.equal(provider.effects, 1);
});

test('A5: repeated transient failure exhausts budget across duplicate deliveries', async () => {
  const { provider, workflow } = setup(scenarios.exhausted);
  assert.equal((await workflow.submit(request)).state, 'exhausted');
  assert.equal((await workflow.submit(request)).state, 'exhausted');
  assert.equal(provider.calls, 2);
  assert.equal(provider.effects, 0);
});

test('A6: permanent rejection is not retried', async () => {
  const { provider, workflow } = setup(scenarios.rejected);
  assert.equal((await workflow.submit(request)).state, 'rejected');
  await workflow.submit(request);
  assert.equal(provider.calls, 1);
  assert.equal(provider.effects, 0);
});

test('A7: committed effect with lost response stays unknown until exact readback', async () => {
  const { provider, workflow } = setup(scenarios.lostResponse);
  const first = await workflow.submit(request);
  assert.equal(first.state, 'unknown');
  assert.equal(first.ticketId, null);
  assert.equal(provider.effects, 1); // The effect exists despite the thrown timeout.
  await workflow.submit(request);
  assert.equal(provider.calls, 1);
  const later = await workflow.reconcile(request.key);
  assert.equal(later.state, 'confirmed');
  assert.equal(later.ticketId, 'synthetic-ticket-1');
  assert.deepEqual(later.history.slice(0, first.history.length), first.history);
  await workflow.reconcile(request.key);
  assert.equal(provider.reads, 1);
  assert.equal(provider.calls, 1);
});

test('A8: absent or delayed readback never authorizes resubmission', async () => {
  const { provider, workflow } = setup(scenarios.unresolved);
  await workflow.submit(request);
  for (let i = 0; i < 3; i++) {
    assert.equal((await workflow.reconcile(request.key)).state, 'unknown');
    assert.equal((await workflow.submit(request)).state, 'unknown');
  }
  assert.equal(provider.calls, 1);
  assert.equal(provider.effects, 0);
});

test('A9: failed, mismatched or malformed evidence fails closed', async () => {
  for (const response of [undefined, { kind: 'confirmed' },
    { ...request, kind: 'confirmed', ticketId: 'synthetic-other', quantity: 99 },
    { ...request, kind: 'not-applied', reason: 'unrecognized' },
    { ...request, kind: 'not-applied', reason: 'busy', key: 'wrong-key' }]) {
    let calls = 0;
    const workflow = new Workflow({ create: async () => { calls++; return response; }, lookup: async () => response });
    assert.equal((await workflow.submit(request)).state, 'unknown');
    assert.equal((await workflow.reconcile(request.key)).state, 'unknown');
    await workflow.submit(request);
    assert.equal(calls, 1);
  }
  const workflow = new Workflow({ create: async () => { throw new Error('offline'); },
    lookup: async () => { throw new Error('offline'); } });
  await workflow.submit(request);
  assert.equal((await workflow.reconcile(request.key)).state, 'unknown');
});

test('A10: provider idempotency binds exact payload independently of workflow dedupe', async () => {
  const provider = new SyntheticProvider();
  const first = await provider.create(request);
  assert.deepEqual(await provider.create(request), first);
  await assert.rejects(provider.create({ ...request, item: 'other-crate' }), /payload conflict/);
  assert.equal(provider.effects, 1);
});

test('A11: separate legitimate action keys are not suppressed', async () => {
  const { provider, workflow } = setup(['success', 'success']);
  const first = await workflow.submit(request);
  const second = await workflow.submit({ ...request, key: 'dispatch:sample-002:v1' });
  assert.equal(second.state, 'confirmed');
  assert.notEqual(first.ticketId, second.ticketId);
  assert.equal(provider.effects, 2);
});

test('A12: invalid input is rejected before effects; returned snapshots cannot alter state', async () => {
  const { provider, workflow } = setup(scenarios.success);
  await assert.rejects(workflow.submit({ ...request, quantity: 0 }), /positive integer/);
  await assert.rejects(workflow.submit({ ...request, extra: 'unsupported' }), /Expected/);
  assert.equal(provider.calls, 0);
  const first = await workflow.submit(request);
  first.state = 'planned';
  first.request.quantity = 99;
  first.history.length = 0;
  const later = await workflow.submit(request);
  assert.equal(later.state, 'confirmed');
  assert.equal(later.request.quantity, 2);
  assert.ok(later.history.length > 0);
  assert.equal(provider.calls, 1);
});

test('A13: a late inconclusive readback cannot overwrite a concurrent confirmation', async () => {
  const provider = new SyntheticProvider(scenarios.lostResponse);
  let release;
  let reads = 0;
  const workflow = new Workflow({ create: input => provider.create(input), lookup: key => {
    reads++;
    if (reads === 1) return new Promise(resolve => { release = resolve; });
    return provider.lookup(key);
  } });
  await workflow.submit(request);
  const slow = workflow.reconcile(request.key);
  assert.equal((await workflow.reconcile(request.key)).state, 'confirmed');
  release({ kind: 'not-found' });
  assert.equal((await slow).state, 'confirmed');
  assert.equal((await workflow.submit(request)).state, 'confirmed');
  assert.equal(provider.calls, 1);
  assert.equal(provider.effects, 1);
});
