/** Escaro #8 — pure-model regression tests. No network, wallet or state mutation. */
import { describe, expect, it } from 'vitest';
import {
  initialState,
  nextIssueId,
  statusTone,
  suggestedBounty,
  isPaid,
  escrowedTotal,
  type Application,
  type Issue,
  type ApplicationStatus,
} from './model';

function issue(id: string): Issue {
  return {
    id,
    repoId: 'cli',
    title: 'Synthetic verification fixture',
    description: 'No external systems accessed',
    criteria: [],
    complexity: 'Trivial',
    bounty: 150,
    created: '2026-10-09',
  };
}

describe('nextIssueId', () => {
  it('starts with 1 for an empty list', () => {
    expect(nextIssueId([])).toBe('1');
  });

  it('increments the specifically referenced 842 seed', () => {
    expect(nextIssueId([issue('215'), issue('842'), issue('301')])).toBe('843');
  });

  it('uses the ACTUAL current initialState seed maximum (843)', () => {
    // The live source also seeds 843, so the next id is 844, not 843.
    expect(nextIssueId(initialState().issues)).toBe('844');
  });

  it('increments a newly added 999 id above the seed maximum', () => {
    expect(nextIssueId([...initialState().issues, issue('999')])).toBe('1000');
  });

  it('treats a nonnumeric id as zero without breaking valid maxima', () => {
    expect(nextIssueId([issue('n/a'), issue('842')])).toBe('843');
    expect(nextIssueId([issue('n/a')])).toBe('1');
  });

  it('treats an empty id as zero under the current implementation', () => {
    expect(nextIssueId([issue('')])).toBe('1');
  });
});

describe('statusTone — every ApplicationStatus', () => {
  it.each<[ApplicationStatus, string]>([
    ['Paid', 'ok'],
    ['Rejected', 'bad'],
    ['Applied', ''],
    ['Assigned', 'warn'],
    ['PR submitted', 'warn'],
  ])('%s maps to %s', (status, expected) => {
    expect(statusTone(status)).toBe(expected);
  });
});

describe('suggestedBounty — all complexity levels', () => {
  it.each([
    ['Trivial', 150],
    ['Medium', 400],
    ['High', 900],
  ] as const)('%s maps to %d', (complexity, reward) => {
    expect(suggestedBounty(complexity)).toBe(reward);
  });
});


/**
 * Escaro #6: escrow accounting and settlement.
 *
 * Source model has five statuses, and deliberately has NO 'Refunded'
 * ApplicationStatus. 'Rejected' does not equal 'Paid'; no invented status
 * is cast into the domain union.
 */
function app(issueId: string, status: ApplicationStatus): Application {
  return { issueId, status, message: 'Bounded synthetic fixture' };
}

describe('isPaid: only a Paid application for the exact issue releases escrow', () => {
  it('is false without applications', () => {
    expect(isPaid('A', [])).toBe(false);
  });

  it.each<ApplicationStatus>(['Applied', 'Assigned', 'PR submitted', 'Rejected'])(
    'does not count %s as paid',
    status => {
      expect(isPaid('A', [app('A', status)])).toBe(false);
    },
  );

  it('is true for a matching paid application', () => {
    expect(isPaid('A', [app('A', 'Paid')])).toBe(true);
  });

  it('ignores a Paid application for another issue', () => {
    expect(isPaid('A', [app('B', 'Paid')])).toBe(false);
  });

  it('recognizes a matching Paid even if other applications were rejected', () => {
    expect(isPaid('A', [
      app('A', 'Rejected'), app('A', 'Paid'), app('B', 'Applied'),
    ])).toBe(true);
  });
});

describe('escrowedTotal: only paid issues leave escrow', () => {
  const a = { ...issue('A'), bounty: 50 };
  const b = { ...issue('B'), bounty: 75 };

  it('returns zero for no issues, irrespective of orphaned payments', () => {
    expect(escrowedTotal([], [app('A', 'Paid')])).toBe(0);
  });

  it('sums all listed issues when there are no applications', () => {
    expect(escrowedTotal([a, b], [])).toBe(125);
  });

  it.each<ApplicationStatus>(['Applied', 'Assigned', 'PR submitted', 'Rejected'])(
    'retains escrow after %s',
    status => {
      expect(escrowedTotal([a, b], [app('A', status)])).toBe(125);
    },
  );

  it('subtracts only the one paid issue; never the neighboring issue', () => {
    expect(escrowedTotal([a, b], [app('A', 'Paid')])).toBe(75);
    expect(escrowedTotal([a, b], [app('B', 'Paid')])).toBe(50);
  });

  it('does not let a later Rejected application put a Paid issue back in escrow', () => {
    expect(escrowedTotal([a, b], [
      app('A', 'Paid'), app('A', 'Rejected'), app('B', 'Assigned'),
    ])).toBe(75);
  });

  it('ignores payment status for issue IDs outside the list', () => {
    expect(escrowedTotal([a, b], [app('C', 'Paid')])).toBe(125);
  });

  it('handles zero-value issue and a paid neighbor without counting the paid amount', () => {
    expect(escrowedTotal([a, { ...b, bounty: 0 }], [
      app('A', 'Paid'), app('B', 'Rejected'),
    ])).toBe(0);
  });

  it('reaches zero only when both issues have a Paid application', () => {
    expect(escrowedTotal([a, b], [
      app('A', 'Paid'), app('B', 'Paid'),
    ])).toBe(0);
  });
});
