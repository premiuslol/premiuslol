# Frantic #132 — Ausca Document Analysis run report

- **Discovery — 254 ms:** I read the Document Analysis SKILL, OpenAPI, and `GET /v1/offers/document.analysis`. The live offer was `document.analysis`, revision `analysis-bytes-r7`, revision digest `sha256:ff16bf19f7a2de0ac19e646bcef953efdbe7a27f8e3cbec652ec82598884ef09`, input schema digest `sha256:7093216a29925031972d61a7ab5f6013936aac9f81c3c54f51a00a3fef66759b`, and output schema digest `sha256:730cf6fb1e6f26fd5ebe335fab86da10099fd0db4f177ba1a2540b4756e00900`.

- **Input artifact:** I used a real 36,728-byte PNG operations snapshot, media type `image/png`, content digest `sha256:16af3ade3e7ecb011866e87405d819b3a68de3bdb0d8b94655f424f3c6d732b6`, committed as `runx:artifact:sha256:f162602b295527fc4f6fedc91b0efe4e5df6b626e197f587ae50388a63833d9d`. Requested features were `FORMS`, `TABLES`, and `LAYOUT`.

- **Unsigned challenge — 1,684 ms:** I sent the exact envelope to `POST /v1/analyze-document` without payment authorization. The 402 x402 v2 requirement fixed `amount=300000` atomic USDC, `network=eip155:8453`, asset `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`, `payTo=0x26572ff23c6c52bfb1a69cb0c9114a8be443b422`, and final invocation `paid_c80f18ba-e9de-4040-9da8-5081ae630f4c`. The fresh idempotency key was `frantic-132-fresh-20260922-8d71a4b2-0471d9a54bdcfcc8bcc599a523cf917b`.

- **Dead end before the successful run:** An earlier identity, `paid_0f577a3d-2896-4fc7-9132-06e4bcdfa316`, got HTTP 503 after one authorized submission. It remained `state=admitted` with `updated_at=2026-09-22T02:26:50.066Z`, while repeated Base checks showed no matching 0.30-USDC transfer and no receipt or result. I did not replay it. After that authorization expired, I abandoned the identity and created the fresh one above.

- **Issue 1 — ambiguous `admitted` after HTTP 503:** The older identity remained publicly readable as `admitted` even though no settlement, receipt, or result could be established. The direct-HTTP guidance would be stronger if it explicitly explained this state after a failed paid request and gave a safe recovery rule for an expired authorization with no chain settlement.

- **Issue 2 — preserve provider error bodies:** My first local wrapper converted non-200/202 responses into a generic `paid_request_uncertain_503` and discarded safe provider fields. I repaired it before the successful attempt so it now retains HTTP status, JSON `status`/`code`/`reason`/`message`, response keys, and whether settlement metadata exists, while excluding sensitive authorization material. This should be the default integration pattern for future transactions.

- **Payment — 3,765 ms from final authorized POST to Base inclusion:** The provider returned HTTP 202 after 2,987 ms with `status=accepted`, invocation `paid_c80f18ba-e9de-4040-9da8-5081ae630f4c`, `state=admitted`, and settlement metadata present. Settlement reported success, payer `0x10efed37fbb1e72b35158fcd0bf84a29e24c55bf`, and transaction `0xf24a914f10ffda9bfb1e0d2b1d07f9d947e4a92d81ad9ed86164b544ef4228e1`. Base block 51,627,909 at `2026-09-22T02:46:05Z` has receipt status 1 and a USDC Transfer of exactly 300000 atomic units to the challenge payTo.

- **Human authorization timing:** The final challenge was ready at `2026-09-22T02:44:05.933Z`; settlement was included at `02:46:05Z`, about 119.067 seconds later including manual review and wallet authorization. That is separated from the 3.765-second post-submission settlement interval.

- **Wait — 31,041 ms:** One authoritative terminal read observed `GET /v1/invocations/paid_c80f18ba-e9de-4040-9da8-5081ae630f4c` at `state=succeeded`, provider `updated_at=2026-09-22T02:46:36.041Z`.

- **Manifest validation:** The inline output schema was `ausca.document_analysis.manifest.v1`; `source_digest` exactly matched the committed PNG. Feature counts were `FORMS=10`, `LAYOUT=10`, `TABLES=1`, with one result page. Recomputing SHA-256 over compact JSON produced `sha256:39068f3e173766eb5af30f8244fd61323563f6c2b9ecc46c5b7920c79a9101a5`, exactly matching `output_digest`.

- **Page-artifact validation — about 3,836 ms:** The manifest page referenced a 57,722-byte result artifact with digest `sha256:a618038177efa7ee730fec3da376a85827bedcc2cafa7f9959fccbfe5e3f9bdd`. I minted a short-lived artifact access URL locally, downloaded the bytes without publishing the URL, verified exact size and SHA-256, and parsed `ausca.document_analysis.page.v1`. It contained 22 lines and 168 structured blocks.

- **Issue 3 — artifact-access response shape:** The SKILL says `POST /v1/artifacts/{artifact_ref}/access` mints a 60-second URL but does not show the response JSON. My verifier initially looked for a top-level URL; a safe key-shape inspection showed the actual field is nested at `artifact.download_url`. A short response example would remove that integration guesswork.

- **Receipt — 13,401 ms:** `https://runx.ai/r/dadec9f1a5e8626a0c2e636d084082db3bca417403e537f5f90f8874dd0be675` is L1 notarized at `2026-09-22T02:46:49.442Z`. The public claim says “Published by Ausca”, “Ausca Document Analysis completed”, and “Declared amount: 0.30 USD.”

- **Issue 4 — receipt versus settlement proof:** The Runx receipt intentionally says wallet addresses and transaction identifiers are not published. That is sensible for privacy, but it means the requested settled-transaction evidence must be gathered separately from Base RPC. A documented optional settlement-reference field would make this verification path more obvious.

- **Concrete changes I would make:** (1) document the safe interpretation/recovery rule for `state=admitted` after an HTTP 5xx with no settlement evidence; (2) include the exact artifact-access response shape showing `artifact.download_url`; and (3) tell direct-HTTP integrators to preserve typed error fields on non-2xx responses while excluding sensitive authorization material from logs.

- **Total elapsed — 163,509 ms (2m 43.509s):** From the final fresh preparation at `2026-09-22T02:44:05.933Z` through Runx notarization at `02:46:49.442Z`. The earlier failed identity is documented separately because it was a recovery dead end rather than part of the successful final invocation’s service latency.

- **Evidence hygiene:** Every identifier above comes from the actual run. Sensitive authorization data and temporary access URLs are not published.
