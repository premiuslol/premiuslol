// A small, single-process model. No network, storage, credentials or dependencies.
export function bindRequest(input) {
  if (!input || Object.keys(input).sort().join(',') !== 'item,key,quantity' ||
      typeof input.key !== 'string' || !input.key.trim() ||
      typeof input.item !== 'string' || !input.item.trim() ||
      !Number.isSafeInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Expected key, item and positive integer quantity only');
  }
  return Object.freeze({ key: input.key, item: input.item, quantity: input.quantity });
}

function matches(evidence, request) {
  return evidence?.key === request.key && evidence?.item === request.item &&
    evidence?.quantity === request.quantity;
}

function confirmed(result, request) {
  return result?.kind === 'confirmed' && matches(result, request) &&
    typeof result.ticketId === 'string' && result.ticketId.length > 0;
}

export class Workflow {
  #actions = new Map();
  constructor(provider) { this.provider = provider; }

  #record(action, state, reason) {
    action.state = state;
    action.history.push({ sequence: action.history.length + 1, state, reason });
  }

  #snapshot(action) { return structuredClone(action); }

  async submit(input) {
    const request = bindRequest(input);
    const existing = this.#actions.get(request.key);
    if (existing) {
      if (!matches(existing.request, request)) throw new Error('Idempotency key payload conflict');
      return this.#snapshot(existing); // Includes in-flight and unknown: never redispatch.
    }
    const action = { request, state: 'planned', attempts: 0, ticketId: null, history: [] };
    this.#actions.set(request.key, action); // Claim before the first async boundary.
    this.#record(action, 'planned', 'Synthetic intent recorded; no action yet');

    for (let attempt = 1; attempt <= 2; attempt++) {
      action.attempts = attempt;
      this.#record(action, 'attempted', 'Attempt started; completion not yet known');
      let result;
      try { result = await this.provider.create(request); }
      catch { result = { kind: 'unknown' }; }

      if (confirmed(result, request)) {
        action.ticketId = result.ticketId;
        this.#record(action, 'confirmed', 'Exact synthetic provider result');
        break;
      }
      // Only this explicit simulator contract proves no side effect occurred.
      // A real HTTP status alone (even 429/500) would not establish this fact.
      if (result?.kind === 'not-applied' && matches(result, request)) {
        if (result.reason === 'busy') {
          if (attempt < 2) {
            this.#record(action, 'retryable', 'Known pre-effect busy; one retry allowed');
            continue;
          }
          this.#record(action, 'exhausted', 'Two attempts used; stop');
          break;
        }
        if (result.reason === 'invalid') {
          this.#record(action, 'rejected', 'Known pre-effect permanent rejection');
          break;
        }
      }
      this.#record(action, 'unknown', 'Missing, malformed or ambiguous result; readback required');
      break;
    }
    return this.#snapshot(action);
  }

  async reconcile(key) {
    const action = this.#actions.get(key);
    if (!action) throw new Error('Unknown action key');
    if (action.state !== 'unknown') return this.#snapshot(action);
    let result;
    try { result = await this.provider.lookup(key); }
    catch { result = { kind: 'unknown' }; }
    // A slower inconclusive lookup must not undo another lookup's confirmation.
    if (action.state === 'confirmed') return this.#snapshot(action);
    if (confirmed(result, action.request)) {
      action.ticketId = result.ticketId;
      this.#record(action, 'confirmed', 'Exact synthetic readback; no new create call');
    } else {
      // Not-found may be delayed visibility. It is never permission to retry.
      this.#record(action, 'unknown', 'Readback inconclusive; remain blocked');
    }
    return this.#snapshot(action);
  }
}
