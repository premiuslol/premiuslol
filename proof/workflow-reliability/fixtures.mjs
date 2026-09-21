// Entirely invented requests and outcomes; no customer or production data.
export const request = Object.freeze({ key: 'dispatch:sample-001:v1', item: 'sample-crate', quantity: 2 });
export const scenarios = Object.freeze({
  success: ['success'],
  transient: ['busy-before-effect', 'success'],
  exhausted: ['busy-before-effect', 'busy-before-effect', 'success'],
  rejected: ['reject-before-effect'],
  lostResponse: ['commit-then-timeout'],
  unresolved: ['timeout-before-effect'],
});
