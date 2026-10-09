# Escaro #70 — inline error for empty display-name save

**STAGED PRIVATE PREPARATION, not an assigned or delivered ETH-LEGION task.**

- Upstream issue: https://github.com/Escaro-Labs/escaro/issues/70
- Exact upstream main: `02907cff0252b07171ac1146d4c0ea8322d5b05b`
- Exact `src/pages/contributor.tsx` blob: `116f3a488565f9706845c1afb12acb9acd7a23b5`
- Patch: `escaro_70.patch`, modifying only the contributor settings display-name Save field.

## Behavior

- Blank or whitespace-only input no longer fails invisibly: a `role="alert"` message appears.
- The input exposes `aria-invalid` while the error is present.
- Editing the field clears the old error.
- A valid display name still follows the existing save and success-toast path.
- The user's original display name is preserved when Save is rejected.

## Verified evidence

[GitHub Actions run 37912453149](https://github.com/premiuslol/premiuslol/actions/runs/37912453149) **SUCCESS** against pinned full upstream source. `git apply --check`, exactly one-file changed, `git diff --check`, source-level guard/error-order assertions PASS. The actual upstream `npm run build` (TypeScript/Vite) passed.

**Test limitation:** this is a source invariant and compile-level check, not a browser-driven React interaction test. Before upstream PR, reviewer should exercise the accessible error behavior in the settings UI, ideally add a component test if desired. No profile mutation or external account/financial operation was performed.

**Delivery:** Do NOT hand to broker until a separate paid executor allocation; advertised task reward is not proof of funding/escrow. AI-assisted change.
