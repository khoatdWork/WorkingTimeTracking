# P2 tests

- npm run test:db: PASS, Firestore emulatorv1.22.0, JRE21 portable from official Adoptium in ignored .private directory. Two tests with assertions for owner access, cross-user/anonymous read-write denial, delete denial, extra fields, invalid settings, bad create version and stale update.
- lint/typecheck/unit/build: PASS locally with public Firebase config and Pages subpath. Production dependency audit0 vulnerabilities.
- E2E local static subpath: Chromium/WebKit PASS, details P1. Additional cross-tab regression final run status follows.
- Firebase Console: project/web app/database/Rules/Google Enabled/Pages domain all observed. No Admin credentials exported. Config public in GitHub repo variables and ignored .env.local.
- Hosted/CI results appended on release. No claim of real Google token refresh/write until verified.

- Real Firebase local/subpath app: Google sign-in PASS, default settings480/60/3 transaction write PASS, explicit reload/read-back PASS. No fake work sessions written to owner's cloud ledger.
- Hosted Firestore anonymous HTTP read:403 PASS.
- Cross-tab regression: PASS in both engines. Depending on storage-event delivery, either editor baseline guard or repository stale version rejects write; draft remains intact.
- CI first run stopped at nonexistent Python Playwright1.65.0; corrected to installed/tested1.62.0 and reran. No gate skipped.
