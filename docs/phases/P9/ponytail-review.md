What this change does: Storage, offline and Firebase sync notices move from the main app shell into Settings → Tài khoản & đồng bộ. Existing state and retry callbacks are passed through an optional AccountPanel status slot.

Looks good. Ship, subject to final verification in test-results.md.

Reviewed the actual tracker-app, account-panel and CSS diff, plus connected save/sync and navigation behavior. Expected load is one personal ledger. The relocation retains status precedence, server-confirmed sync semantics and the retry callback. The account panel used during local-load failure does not require the optional status slot. Local-load/save errors and the actionable PWA update banner remain available.

Status messages keep role=status and long text wraps inside the account panel. The existing account layout is reused; no new dependency, state machine, schema or persistence path is added. No blocking source finding was identified.

Not checked: independent final test execution, browser rendering, hosted deployment, real Firebase authentication/sync or physical devices. Final verification belongs to test-results.md.
