What this change does: Connects the tracker to Google Auth and private Firestore state, then builds and deploys a static GitHub Pages app after checks.

Read auth callback, stale-load generation guard, transaction/version handling, validator, rules, backup UI, deploy workflow and tests. Owner isolation is enforced by rules. Errors keep drafts and do not report saved early. No server/private credentials in client. WFH sends no communication externally.

Known limit: rules validate top-level/settings/version, app validates individual workdays. This is the owner's self-reported ledger; do not treat browser-entered time as trusted payroll evidence. Single document capped850KB in app. These are explicit scope decisions.

Verdict: ship after CI and hosted smoke complete.
Not checked: independent reviewer, physical phones, live Google account test until recorded.

Release follow-up: CI verify-build/deploy SUCCESS, HTTPS Chromium/WebKit full suite PASS, real Google login (local + Pages), default settings cloud write/read PASS. Verdict: Ship. Remaining unchecked items: physical phones, long-duration Auth refresh, independent reviewer.
