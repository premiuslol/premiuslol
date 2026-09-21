import { Workflow } from './workflow.mjs';
import { SyntheticProvider } from './provider.mjs';
import { request, scenarios } from './fixtures.mjs';

console.log('SYNTHETIC / LOCAL ONLY — fictional dispatch tickets, no external actions');
for (const [name, outcomes] of Object.entries(scenarios)) {
  const provider = new SyntheticProvider(outcomes);
  const workflow = new Workflow(provider);
  const first = await workflow.submit(request);
  const duplicate = await workflow.submit(request);
  const later = await workflow.reconcile(request.key);
  console.log(JSON.stringify({ scenario: name, first: first.state, duplicate: duplicate.state,
    later: later.state, attempts: later.attempts, createCalls: provider.calls,
    sideEffects: provider.effects, history: later.history }, null, 2));
}
