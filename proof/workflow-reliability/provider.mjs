import { bindRequest } from './workflow.mjs';

// An invented provider with an explicit, exact-key readback/idempotency contract.
// These semantics are NOT claims about any third-party platform.
export class SyntheticProvider {
  #tickets = new Map();
  #outcomes;
  calls = 0;
  reads = 0;
  constructor(outcomes = ['success']) { this.#outcomes = [...outcomes]; }
  get effects() { return this.#tickets.size; }

  async create(input) {
    const request = bindRequest(input);
    this.calls++;
    const existing = this.#tickets.get(request.key);
    if (existing) {
      if (existing.item !== request.item || existing.quantity !== request.quantity) {
        throw new Error('Provider key payload conflict');
      }
      return structuredClone(existing);
    }
    const outcome = this.#outcomes.shift();
    if (outcome === 'busy-before-effect' || outcome === 'reject-before-effect') {
      return { ...request, kind: 'not-applied', reason: outcome === 'busy-before-effect' ? 'busy' : 'invalid' };
    }
    if (outcome === 'timeout-before-effect') throw new Error('Synthetic timeout');
    if (outcome !== 'success' && outcome !== 'commit-then-timeout') {
      throw new Error('No defined synthetic outcome');
    }
    const ticket = { ...request, kind: 'confirmed', ticketId: `synthetic-ticket-${this.effects + 1}` };
    this.#tickets.set(request.key, ticket);
    if (outcome === 'commit-then-timeout') throw new Error('Synthetic response lost after commit');
    return structuredClone(ticket);
  }

  async lookup(key) {
    this.reads++;
    return structuredClone(this.#tickets.get(key) ?? { kind: 'not-found' });
  }
}
