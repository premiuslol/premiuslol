# Settla #85 — remove unused legacy payment hook

**PREPARED FOR A FUTURE PAID ASSIGNMENT; NOT YET CLAIMED OR DELIVERED.** This is a source-pinned owner-controlled review packet, not a direct upstream PR or payment claim.

- Upstream issue: https://github.com/Settla-Labs/settla-app/issues/85
- Pinned main: `8096ce2d49f58ec3a869599f2d6bfc7e722c3638`
- Deleted file blob: `70adb2a484ba4c1fb33e8a3e853f254070a339ae`
- Proposed artifact: `settla_85.patch`, removing exactly `src/features/wallet/presentation/hooks/useWalletPay.ts` (no other production change).
- Why safe: repository-wide source search after deletion found no remaining `useWalletPay` or `/stellar/pay` reference; the wallet barrel already exports `useSend`, not `useWalletPay`. Current signed-transaction flow via `useSend` remains untouched.

## Source-pinned acceptance

[GitHub Actions run 37911992744](https://github.com/premiuslol/premiuslol/actions/runs/37911992744) **SUCCESS**:
- `git apply --check` on complete pinned upstream, exact one-file deletion and `git diff --check` PASS.
- Complete upstream `pnpm test`: **376 tests passed / 43 files**.
- Complete upstream `pnpm run lint`: **0 errors / 13 warnings**.
- TypeScript `tsc --noEmit` has errors on the unmodified upstream baseline; the runner compared the exact full diagnostics on patched and unpatched source and found **byte-for-byte equality and the same exit status**. This patch introduces **zero new TypeScript diagnostics**; it does not repair pre-existing failures.

**Baseline environment caveat:** Upstream `pnpm-workspace.yaml` lacks `packages`, and the `pnpm-lock.yaml` override configuration conflicts with frozen installs. The isolated CI runner TEMPORARILY adds a workspace declaration and installs with `--no-frozen-lockfile --ignore-scripts`. Those changes do not appear in the proposed patch.

**Commercial gate:** We do not have an explicit paid ETH-LEGION executor allocation for this follow-on issue. The posted `Claiming` comment by the broker is not itself a guaranteed sponsor payment. Release this packet for broker review only once a new paid 85/15 assignment and the next delivery sequence are confirmed. No wallet, signer, financial transfer, third-party account or external PR is touched in this preparation.

AI-assisted technical preparation with reproducible checks.
