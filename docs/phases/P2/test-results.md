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

Final CI source revision: `03c473f67af253872f5dd755c66acb9214f3ccf1`, run https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42563854172. verify-build steps lint/typecheck/unit/Firestore emulator/build/Python browser install/Chromium+WebKit E2E all PASS on Ubuntu. Test clock now pauses only around elapsed-time assertions, then resumes so notification animations finish; this fixes a CI-only1second drift without relaxing exact second assertions. The skip link remains visible for keyboard focus, and button transitions are limited to colors.

Final hosted release: same run verify-build SUCCESS + deploy SUCCESS. Pages HTTP200. `APP_URL=https://khoatdwork.github.io/WorkingTimeTracking/ npm run test:e2e`: Chromium PASS, WebKit PASS for complete suite including exact hours and cross-tab conflict. Hosted home/settings smoke in both engines: console errors0, page errors0. Real Google sign-in on Pages PASS; reads same Firestore default480/60/3 settings. Live cloud write verified via local origin earlier, no synthetic work sessions inserted.
