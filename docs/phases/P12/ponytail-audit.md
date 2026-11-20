What this repo does: It keeps a person's work-time ledger locally and on Firebase. This audit follows data ownership, synchronization, imports/deletions and recovery at personal use with multiple sessions.

The old local-wins policy and silent guest fallback were the principal risks; P12 replaces both. Data-flow review found no additional unhandled destructive path in the changed scope after fixing stale import confirmation, initial-pull edits, unknown legacy baselines, and recovery-before-replacement ordering.

Recovery is bounded locally (10 snapshots/about1MB) and append-only in Firestore. Full cloud snapshots grow with the ledger and write count; the source names the limit and migration to monthly storage. This is an operating limit, not free unlimited storage. Quota failure keeps pending data and blocks replacement. Client Rules cannot constrain project administrators or restore offline data erased before upload.

Verdict: Approved app/Rules release completed20/11/2026 (4e94360, Actions44717065768 success, Console active Rules9:27PM). Hosted guest regression/PWA passed. Retain backup and complete real-device acceptance before claiming live P12 sync verified.
Not checked: unrelated domain calculations beyond their existing passing tests, actual project storage growth, physical iOS eviction behavior. No repository-wide clean-bill claim and no independent reviewer claim.
