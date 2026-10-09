# Settla-Labs/settla-app #89 — paid executor PREPARATION

Upstream issue: https://github.com/Settla-Labs/settla-app/issues/89

Upstream exact main commit: `8096ce2d49f58ec3a869599f2d6bfc7e722c3638`.

Patch: `settla_89.patch` removes exactly three unreferenced fixture modules:

- `src/app/(protected)/p2p/utils/cryptoAssets.ts`
- `src/app/(protected)/p2p/utils/paymentMethods.ts`
- `src/app/(protected)/dashboard/utils/assets.ts`

It intentionally preserves the live `src/features/order/mocks/demo-order.ts` fixture behind `NEXT_PUBLIC_DEMO_MODE`. No payment or wallet signing code changes.

## Tested result

[Source-pinned, isolated GitHub Actions run 37908627923](https://github.com/premiuslol/premiuslol/actions/runs/37908627923): `git apply --check` on the complete upstream repo, exactly three deletions, `pnpm test` **376 PASS / 43 files**, `pnpm run lint` **0 errors / 13 warnings**.

**Baseline caveat:** the upstream `pnpm-workspace.yaml` did not specify packages, and `--frozen-lockfile` failed an existing override mismatch. In this isolated CI fixture only, the runner appended `packages: ['.']` and ran `pnpm install --no-frozen-lockfile --ignore-scripts`. These changes are **not included in the submitted patch** and upstream's unmodified install path was not green.

The issue asks that 'no fabricated account numbers remain in src', but also instructs keeping the demo fixture: that retained fixture still contains fictitious bank details. This contradictory acceptance condition needs a maintainer decision; the patch does not break legitimate demo behavior to satisfy an absolute text requirement.

**Status:** PREPARED; not yet delivered for broker review. The broker assigned sequential delivery: Sounding #100 first, then Settla #89 after #100 review. This is not an upstream PR, acceptance or payout receipt.
