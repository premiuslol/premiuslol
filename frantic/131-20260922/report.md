# Frantic #131 Document OCR — delivery report

- Discovery took 263 ms: live offer document.ocr resolved to revision ocr-fixed-r8 with exact revision/input/output schema digests pinned before payment.
- Artifact commit took 1,476 ms: a public 21,530-byte scanned-PDF sample from cseas/ocr-table was committed as application/pdf; returned size, digest and media type matched local bytes.
- Issue: one product uses four names — document-ocr (skill), document.ocr (offer), text-extract.* (schema files), and /v1/extract-text (route). A binding map would reduce wiring mistakes.
- Challenge took 1,960 ms: unsigned invocation returned x402 v2 for exactly 250000 atomic USDC on Base to the expected USDC asset/payTo, bound to paid_8efd46ae-36c9-41ef-ba04-932c25cde97e.
- Issue: bazaar.info contains example idempotency_key=ausca-x402-discovery-example while runx.invocation.info contains the real bound key; label example versus authority more clearly.
- Payment settled 8,509 ms after final authorized submission: Base tx 0x3a4d34dd8d9cd3b3459b1b08941263e9cdfe346ed5a159721a11701d22ae5f73 has status 1 and exactly 250000 atomic USDC transferred to challenge payTo.
- Invocation response took 7,637 ms: HTTP 202, status=accepted, body keys inspect_url/invocation/status, initial state=admitted; the repaired wrapper preserved safe response diagnostics without logging signature material.
- Wait to terminal was 18,352 ms from submission: owner-page poll observed succeeded at 2026-09-22T03:34:12.843Z; later authoritative readback matched.
- Result validation passed: output schema ausca.document_ocr.output.v1, source digest matched the committed PDF, 31 non-empty confidence-scored lines, 1,164 normalized text characters, and recomputed SHA-256 exactly matched output_digest sha256:034e0f487de972bfb7d2e4da065558e6ceb3549784a1ec3bedf7c3e2231524af.
- Issue: SKILL prose says lines carry confidence and page, but page is optional in schema and was absent on all 31 lines in this PDF output. Make optionality explicit or populate it consistently.
- Receipt notarized 6,811 ms after provider terminal: https://runx.ai/r/98b381eeb73a8267a1672856541f23a7752fee5a44b864eaad975a4986b425cd identifies Ausca Document OCR / document.ocr / USD 0.25 / occurred_at 03:34:12.843Z.
- Issue: immediately after terminal, the public receipt URL returned HTTP 404; the same URL became readable after notarization. Document a short publication-lag retry/readiness rule.
- Total final-run elapsed was 184,931 ms from live preparation to receipt notarization, including local wallet review/signing.
- Frantic run-first was allowed. The first #131 claim POST was rejected with HTTP 409 pending_review_limit while #132 and #133 awaited human review; that rejected attempt was preserved and never blindly retried.
- After #132 and #133 both cleared review and paid, live status showed zero active/pending-review work and #131 still funded/open with one slot. The exact rejected journal entry was reconciled locally under a fail-closed one-shot maintenance check, then one fresh claim succeeded as 28e0a6bb-6b27-4be4-98f0-8ccc46b560f0 at 2026-09-22T10:20:25.212Z. The existing OCR invocation/receipt was reused; no provider payment or OCR invocation was repeated.
- No secrets, wallet signatures, private keys, seeds, Frantic credentials or temporary capabilities are present in this report.
