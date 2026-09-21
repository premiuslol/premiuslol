# Public export manifest

Classification: **PUBLIC-SAFE SYNTHETIC / LOCAL PROOF**. Prepared for later
publication; this manifest does not authorize publishing anything.

Export exactly these seven files, preserving names in one directory:

| File | Contents |
|---|---|
| `README.md` | Synthetic case study, diagram, findings and acceptance map |
| `fixtures.mjs` | Invented request and six deterministic outcome sequences |
| `workflow.mjs` | Standalone local state/idempotency/retry/reconciliation model |
| `provider.mjs` | Fictional in-memory dispatch-ticket provider |
| `workflow.test.mjs` | Thirteen executable acceptance checks |
| `demo.mjs` | Deterministic local walkthrough |
| `PUBLIC_EXPORT.md` | This allowlist and export checklist |

## Checklist for later publication

- Copy only the seven allowlisted files from the reviewed commit into an empty
  export directory. Do not publish repository history, parent folders, internal
  route documents, local paths, screenshots or incidental generated files.
- Review the exact exported bytes again if any file has changed. All examples
  must remain invented; no credentials, customer data, addresses or private links.
- Keep the synthetic/local/non-client labels, contract assumptions and production
  limitations with the code. Do not describe test counts as live reliability or
  revenue evidence, or this model as an n8n/Make/Zapier integration.
- Run `node --test workflow.test.mjs` and `node demo.mjs` in the empty export
  directory. Nothing outside this directory is required by the bundle.
- Confirm the publication destination, capacity and authorization separately.
  Export preparation does not activate a listing or change a live service.

No real customer incidents, private project code or production observations were
used to construct these examples. The code was written for this synthetic proof.
