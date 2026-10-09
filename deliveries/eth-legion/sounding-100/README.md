# Sounding #100 — private implementation, publicly reviewable

**Source issue:** https://github.com/Sounding-Labs/sounding/issues/100

**Original source:** `server/index.html` on `Sounding-Labs/sounding`, Git blob `dfedfb766c378c4409f35df65eea69bf1bfcebb5`, last rechecked unchanged on 2026-10-09.

**Deliverable:** `sounding_100.patch` changes ONLY the JSDoc immediately above `formatBalance`. The function body is deliberately unchanged. No wallet, signing, money or network effects.

The JSDoc records actual behavior: numbers >=1000 use two decimal places; >=1 and <1000 use four; all values <1 (including zero and negatives) use seven. `Number#toFixed` rounds/pads, returns `NaN` and infinity strings for those Number values, and throws for inputs with no `toFixed` method.

**Reproducible check:** `node verify_format_balance.cjs` — 15 isolated tests passed on Node.js 22; no dependencies installed or internet requested. This checks the isolated exact function, **not full upstream repo CI**. Apply in a clean exact-version upstream clone with `git apply --check sounding_100.patch`; inspect the diff and run the project's checks before upstream submission.

**Status:** public review packet for the ETH-LEGION executor's paid go-signal (October 9). This is not itself an upstream merged PR, final maintainer acceptance, $34 payout receipt or evidence of funded escrow. The verifier must review and submit upstream through an authorized route. No unpaid trial agreed.

**Disclosure:** AI-assisted drafting and validation; human/code review required before upstream publishing.
