# P4 tests

- Lint/typecheck/build production basePath /WorkingTimeTracking: PASS.
- Unit22 PASS: fixed8/10 exact net independent of lunch; request/note/reload retained; change replaces rather than adds; office6+WFH10 balances; weekends/month boundary; rejects9/invalid/future/mixed/leave/office credits; overnight overlap rejected; boundary midnight allowed; legacy timed WFH retained; JSON/local/CSV roundtrip.
- Firestore emulator2 PASS: existing owner/isolation/version checks plus owner write of a day with wfhHours10 under unchanged rules. Java21.
- Browser full regression Chromium/WebKit: office exact-second tracking, conversion office sessions→fixedWFH with cancel/confirm,8↔10 selector, no start/pause WFH buttons, request/report/backup/draft/conflict,5 widths, axe on3 screens PASS.
- Dedicated WFH Chromium/WebKit: empty day→WFH→8/10, no auto credit on mode alone,10hour net =2hour surplus, request/reload,320px, future planned WFH disabled hours/no credit, legacy request/note edit keeps sessions PASS. Fixed local WFH save while offline PASS. Fixed→holiday cancel/confirm guard PASS on CI/hosted.
- Existing PWA offline/installability/update/failed-install rollback regression PASS. Physical devices/native installation/real cloud WFH writes NOT RUN; no synthetic production cloud entries.

## Release result

Source `93776317c11b1d3cb5b0b50bc64805a329c55a5c`, Actions [42568082493](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42568082493): verify-build SUCCESS, deploy SUCCESS. CI passed all lint/typecheck/22unit/2Firestore tests/build/browser regression/dedicated WFH/PWA checks. Hosted cache `du-gio-pwa-%2FWorkingTimeTracking%2F-e6763ec9bdb9bfe7`.

Hosted [Pages](https://khoatdwork.github.io/WorkingTimeTracking/) full test:e2e PASS: app regression and dedicated WFH suite Chromium/WebKit; Chromium PWA offline/ready/cache checks; WebKit hosted manifest/icons/worker smoke (local offline navigation handled by network-refusal fixture as P3). No production Firebase work entries added. Test browsers isolate all synthetic WFH credits in local storage.

Physical phones/native installation/live cloud WFH writes still NOT RUN. Existing Google Auth/Firestore transaction path unchanged; schema field storage checked with emulator. This final evidence commit changes documentation only.
