# P4 tests

- Lint/typecheck/build production basePath /WorkingTimeTracking: PASS.
- Unit22 PASS: fixed8/10 exact net independent of lunch; request/note/reload retained; change replaces rather than adds; office6+WFH10 balances; weekends/month boundary; rejects9/invalid/future/mixed/leave/office credits; overnight overlap rejected; boundary midnight allowed; legacy timed WFH retained; JSON/local/CSV roundtrip.
- Firestore emulator2 PASS: existing owner/isolation/version checks plus owner write of a day with wfhHours10 under unchanged rules. Java21.
- Browser full regression Chromium/WebKit: office exact-second tracking, conversion office sessions→fixedWFH with cancel/confirm,8↔10 selector, no start/pause WFH buttons, request/report/backup/draft/conflict,5 widths, axe on3 screens PASS.
- Dedicated WFH Chromium/WebKit: empty day→WFH→8/10, no auto credit on mode alone,10hour net =2hour surplus, request/reload,320px, future planned WFH disabled hours/no credit, legacy request/note edit keeps sessions PASS. Fixed local WFH save while offline PASS. Fixed→holiday cancel/confirm guard added to final CI.
- Existing PWA offline/installability/update/failed-install rollback regression PASS. Physical devices/native installation/real cloud WFH writes NOT RUN; no synthetic production cloud entries.

Final suite/CI/hosted result appended after release.
