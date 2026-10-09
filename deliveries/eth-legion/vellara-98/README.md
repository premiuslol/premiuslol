# Vellara #98 — supported security-version policy

**Status:** PREPARED FOR FUTURE PAID ALLOCATION. Not claimed or submitted upstream; no bounty or payment is reserved.

Original issue: https://github.com/Vellara-Labs/vellara/issues/98

Exact upstream source: main `669970a061210bc39c681972287ad3edc5d36724`, SECURITY.md blob `a1a4340fa511536bf250b2b12542f04b16f6e2ac`, code-of-conduct.md blob `5586305def8886fff9fb90d4640fa2f15cc57cba`, CHANGELOG.md blob `1f6f7c177138d17d468e6712cae627db66d1de9c`.

Patch `vellara_98.patch` updates precisely two Markdown files. It names **0.1.0** as latest tagged release from CHANGELOG, distinguishes maintained `main` from frozen tagged history without promising unsupported backports, identifies the six `contracts/` crates, `sdk/` and `frontend/`, and routes security vulnerabilities to SECURITY.md while keeping code-of-conduct misconduct reporting separate.

[GitHub Actions 37911873457](https://github.com/premiuslol/premiuslol/actions/runs/37911873457): source-pinned full Git patch applies cleanly; exact version/scope/reporting-content checks PASS; the pinned original repository's `cargo test --features testutils` succeeds across its contract crates. The documentation-only patch is validated separately; no deployed contract security audit has been performed, no external signing, network transaction or secret used.

**Important scope:** the source SECURITY.md's existing private reporting link points to the historical upstream owner `zeemscript/TrustMint`. This proposal does not replace that link with a guessed contact channel or pretend that a Vellara security inbox is verified; if the maintainer wants repository-local private disclosure, they must confirm the correct reporting route.

Do not submit without the broker's paid task allocation and authorized upstream review path. AI-assisted documentation.
