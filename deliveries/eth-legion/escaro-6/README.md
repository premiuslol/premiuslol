# Escaro #6 — escrow accounting regression tests

**Status:** PREPARED FOR A FUTURE PAID GO-SIGNAL. This is NOT delivered to ETH-LEGION or upstream and is not a funded/settled task.

- Upstream issue: https://github.com/Escaro-Labs/escaro/issues/6
- Exact source: `Escaro-Labs/escaro` main `02907cff0252b07171ac1146d4c0ea8322d5b05b`; `src/lib/model.ts` blob `df7c2e917b6ce61c095f98a51ad36536705ac87d`.
- Proposed file: `model.combined.test.ts` → `src/lib/model.test.ts` in upstream.
- Rationale: issue #8 was assigned earlier to the same executor and targets the same test filename. The combined file preserves #8's complete tests while adding distinct #6 `isPaid` and `escrowedTotal` cases, avoiding overwrite/revert conflicts.
- New coverage: no applications; each `Applied`, `Assigned`, `PR submitted`, `Rejected`; a correctly paid issue; an unrelated Paid application; mixed issues; multiple proposals; paid then rejected; no issues; empty/zero-value bounties. Importantly **Refunded is not a valid ApplicationStatus** in this version, so no made-up enum member is tested.
- Real source test: [source-pinned CI run 37911665402](https://github.com/premiuslol/premiuslol/actions/runs/37911665402) **33 tests pass** combined with #8 and `npm run build` passes.
- Upstream lacks Vitest in `package.json`; the CI runner used temporary `vitest@2.1.9 --no-save` without changing our staged solution. An upstream PR must agree the permanent runner/dependency strategy with maintainers.
- If Escaro #8 merges first, the verifier should append only the #6 block to the new upstream `model.test.ts` rather than overwrite that merged file. Preserve the existing tests.
- No wallet, network, contract or production mutation. AI-assisted source-bound unit tests.
