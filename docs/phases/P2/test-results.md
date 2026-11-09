# P2 tests

- npm run test:db: PASS, Firestore emulatorv1.22.0, JRE21 portable from official Adoptium in ignored .private directory. Two tests with assertions for owner access, cross-user/anonymous read-write denial, delete denial, extra fields, invalid settings, bad create version and stale update.
- lint/typecheck/unit/build: PASS locally with public Firebase config and Pages subpath. Production dependency audit0 vulnerabilities.
- E2E local static subpath: Chromium/WebKit PASS, details P1. Additional cross-tab regression final run status follows.
- Firebase Console: project/web app/database/Rules/Google Enabled/Pages domain all observed. No Admin credentials exported. Config public in GitHub repo variables and ignored .env.local.
- Hosted/CI results appended on release. No claim of real Google token refresh/write until verified.
