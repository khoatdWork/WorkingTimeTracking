# P8 verification — 10/11/2026

Initial10/11 app source built as a static export with PWA cache `du-gio-pwa-%2F-a07eeaa46e44fc4b`, served locally at `/`. Tests used isolated contexts and fake ledger data. No test wrote real-account Firebase data. Deployment follow-up11/11 is recorded below.

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, static export and PWA generation |
| `npm run test:unit` | PASS,44 tests/6 files; calculation/data logic unchanged |
| `npm run test:db` | PASS,2 rules tests on demo Firestore emulator/Java21 |
| `tests/e2e/settings.py` | PASS Chromium/WebKit |
| `tests/e2e/app.py` | PASS Chromium/WebKit |
| `tests/e2e/wfh.py` | PASS Chromium/WebKit |
| `tests/e2e/holidays.py` | PASS Chromium/WebKit |
| `tests/e2e/leave.py` | PASS Chromium/WebKit |
| `tests/e2e/pwa.py` | PASS Chromium/WebKit offline/manifest/installability; Chromium confirmed update/cancel/rollback and new notice routing/guard |
| `npm run test:sync` | PASS Chromium/WebKit; Auth/transport fixture |
| Hosted P8 | PASS11/11; release follow-up below |
| Real Google Auth & Firebase sync | NOT RUN |
| Physical iPhone/Android/installed physical PWA | NOT RUN |

The new Settings suite checks that the root has only five navigation rows and no editable inputs or backup actions. It opens each subsection, uses Back, switches bottom tabs and verifies root reset. At320/390px it checks every view for horizontal overflow and axe WCAG A/AA violations. Screenshots are under ignored `output/playwright/P8/`; root inspected root320/root390 and final Hours/Backup screenshots. Each submenu keeps one visible page title.

Draft cases: Back prompts; cancel retains the edited30-minute lunch value. Switching tabs and accepting discard leaves persisted settings unchanged. With another tab saving30 while the first drafts45, the first retains45, a stale save is rejected and persisted30 is preserved. Returning from holiday DayEditor retains the holiday subsection/month/note. Backup reset cancel preserves the ledger; confirmed reset clears it. Save controls are disabled during persistence; save errors do not reset input.

Existing production suites now open the appropriate submenu before editing/exporting/installing. Holidays explicitly confirm dropping a failed conflict draft before opening a saved day. General app checks still cover exact clock, reload/pause, fixed WFH, manual entry, reports, JSON import/export and stale day drafts across320/360/390/430/1280px. Holiday/leave tests retain inclusive ranges, conflicts, month/year boundaries, targets, backups and deletion safeguards.

PWA regression verifies offline check-in/pause/reload/new window, manifest/icons/scope, unrelated cache privacy and failed-install rollback. The two-release fixture tests a waiting update at Settings root: Xem bản cập nhật opens Cài ứng dụng directly. From dirty hour rules, that notice opens the discard guard; Tiếp tục chỉnh sửa retains the draft, and saving still permits the normal confirmed update. Other-tab drafts survive the update. Fixture sync still covers startup pull, local backup, offline/reopen/reconnect, realtime pull, errors and account isolation.

Execution: app/WFH/PWA ran against `http://127.0.0.1:3140/`; Settings/holiday/leave ran against isolated port3137. Settings and final screenshots were rerun after the last heading/busy-controls changes. PWA alone was rerun after adding notice-routing/dirty-guard assertions. All constituent suites passed; the sequential `npm run test:e2e` command itself was not rerun as one combined invocation. The new suite is registered in that runner.

Local commands:

```powershell
$env:E2E_PORT='3140'
npm run test:e2e
```

The initial10/11 local tests alone do not establish hosted behavior. Release follow-up below records hosted checks; live Firebase acknowledgement and physical-device behavior remain unverified.

## Release follow-up — 11/11/2026

Source ecf7375eb231c0b184d988588fe98193d561e43e deployed with P7. [Actions42946545547](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42946545547) SUCCESS: verify-build4m48s/deploy8s, completed09:36:05ICT. CI ran npm ci/lint/typecheck/44unit/2Rules/build/full npm test:e2e including Chromium+WebKit production/PWA/sync fixture on the real Pages subpath.

Hosted HTTP main/manifest/sw return200, fixture `tests/e2e/sync-fixture.html` returns404. Manifest id/scope/start_url all `/WorkingTimeTracking/`, display standalone. Hosted cache du-gio-pwa-%2FWorkingTimeTracking%2F-39d7eb10f41038fa matches the CI build.

Hosted settings/leave/holiday/app/WFH suites all PASS Chromium+WebKit using the unchanged test sources and ignored `output/verification/P7-P8/run_hosted.py` runner. The runner only redirects APP_URL and output paths. Settings confirms the root list, five detail pages, back/tabs, dirty cancel/discard/stale-save protection, holiday month return and backup reset; axe/mobile320390 PASS. Hosted Settings root320, WebKit root390 and Hours320 screenshots were inspected with no clipping/overflow. Evidence lives in ignored `output/playwright/hosted-ecf7375/{settings,leave,holidays,app,wfh,pwa}/`.

Hosted Chromium HTTPS PWA manifest/installability/offline checkin/pause/reload/newwindow/reconnect/cache privacy PASS. Hosted WebKit manifest/icons/worker/ready PASS; offline navigation remains covered locally because of WebKit automation limitations. Confirm/cancel/update/rollback and new Settings update routing remain verified by CI fixture, not a live two-version physical-device update.

All hosted suites use fresh unauthenticated browser contexts with synthetic guest data; no real Firebase cloud records were created/imported/reset. Real-account Firebase authentication/sync and physical iPhone/Android remain NOT RUN.
