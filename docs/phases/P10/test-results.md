# P10 — Test results

## Release verification11/11/2026

Deployed source51dd10f617059c05c8609191784e6ff21de18ecf. [Actions42956539128](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42956539128) SUCCESS, verify-build5m15s/deploy12s, hoàn tất11:07:23ICT. [Hosted app](https://khoatdwork.github.io/WorkingTimeTracking/). Mọi kiểm tra hosted dùng guest contexts mới, dữ liệu giả, không đăng nhập hay ghi Firebase thật.

| Release check | Status | Evidence / limit |
| --- | --- | --- |
| CI lint/typecheck/build | PASS | Exact deployed source, Pages basePath |
| CI unit/Rules | PASS |44unit/6files,2Rules emulator/Java21 |
| CI full npm run test:e2e | PASS | app/Today/WFH/holidays/leave/settings/PWA/sync fixture Chromium+WebKit |
| Hosted app/WFH/holidays | PASS | Production regression both engines, each runner exit0 |
| Hosted Today/leave/settings | PASS | Both engines, six rows, add today→Today→reload/note/pill/noStartWFH/editor; prior-day active/stop; dirty/baseline/month/stale/targets/JSON; axe320390 |
| Hosted PWA | PASS | Chromium installability/icons/scope/offline check-in/pause/reload/new window/reconnect/cache privacy; WebKit manifest/icons/worker/ready smoke |
| Release identity | PASS | Live sw.js cache du-gio-pwa-%2FWorkingTimeTracking%2F-486b77e47d3fad89 equals CI build log |
| Hosted visual | PASS | Root/agent inspected leaveToday320390 and six-row Settings320; no clipping |
| Real Firebase account | NOT RUN | No live-account sync test in P10 |
| Physical devices | NOT RUN | No device installation test |

Evidence: output/verification/P10/ci.log and hosted-{app,today,wfh,holidays,leave,settings,pwa}.log; output/playwright/hosted-51dd10f/{suite}/. Hosted heights match local: office921/933,WFH956/956,running1022/1034px at320/390; leaveToday844px; prior-active leave951/927px. WebKit hosted offline navigation is not claimed: its emulated offline mode bypasses workers; local/CI suite tests actual cached navigation via server refusal. Full update/rollback and sync fixture checks ran on CI rather than against the public server.

## Local preview history before release

Ngày 11/11/2026. Local production static export, http://127.0.0.1:3140/, cache du-gio-pwa-%2F-bef9fdc04134abf0. Bản cuối làm rõ thẻ nghỉ hôm nay sau khi chuyển nghỉ phép sang Cài đặt. Fresh browser contexts và dữ liệu giả, không ghi Firebase tài khoản thật.

Sau điều chỉnh thẻ nghỉ: chạy lại npm run lint/typecheck/build,44unit/6files và2Rules emulator Java21 PASS. Targeted tests/e2e/today.py và leave.py Chromium/WebKit PASS trên build mới; full runner ghi phía dưới chạy trước thay đổi trình bày cuối này. Settings→thêm nghỉ hôm nay kèm ghi chú→Today→reload giữ heading24px/note/pill Nghỉ phép, không Start/WFH, vẫn có sửa ngày. Có ca hôm trước đang chạy thì pill không is-working, cảnh báo/nút kết thúc hiện; stop giữ trạng thái nghỉ. Axe/overflow/bbox320390 PASS. Root/agent xem chromium-leave-today-{320,390}-viewport.png và chromium-leave-prior-session-active-320-viewport.png tại output/playwright/P10. Ngày nghỉ vừa viewport844px; ca cũ đang chạy951/927px ở320/390. Cập nhật preview người dùng qua PWA UI, không thêm ngày phép vào dữ liệu của họ.

| Check | Status | Evidence / limit |
| --- | --- | --- |
| Source review | PASS | Traced disclosures, daily controls, prior-day warnings and shell state |
| Lint | PASS | npm run lint |
| Typecheck | PASS | npm run typecheck |
| Production build | PASS | npm run build, static export + PWA |
| Unit tests | PASS | npm run test:unit,44 tests/6 files |
| Firestore Rules emulator | PASS | npm run test:db,2 tests/demo project/Java21 |
| Today Chromium/WebKit | PASS | Closed defaults, Enter/Space, no leave management, calendar P/current leave, WFH/request/reload, sessions/prior-day active leave |
| Leave Chromium/WebKit | PASS | Settings location, tomorrow/range/conflicts/stale/JSON/editor/delete/targets retained |
| Settings Chromium/WebKit | PASS | Six sections/back/leave guard/clean baseline/cancel error/month/axe320390 |
| Final visual/mobile/accessibility checks | PASS | axe320390, overflow, row width/height/no overlap; root/agent screenshots below |
| Combined npm run test:e2e | PASS | Final APP_URL=http://127.0.0.1:3140/ npm run test:e2e exit0; all suites/PWA/sync fixture Chromium+WebKit |
| Hosted P10 | NOT RUN | Not deployed at this record |
| Real Firebase account | NOT RUN | No new live-account evidence |
| Physical devices | NOT RUN | No evidence |

Measured at844px viewport height with the same isolated state and320/390 widths:

| State | Before320 /390 | After320 /390 | Reduction |
| --- | --- | --- | --- |
| Empty office |1739 /1766px |921 /933px |47% |
| Fixed WFH8h |2049 /2052px |956 /956px |53% |
| Running office |1937 /1944px |1022 /1034px |47% |

Final heights match Chromium/WebKit. Every closed trigger is full group width (288/344px), at least64px high and does not overlap another row. Request is64px, week/sessions about75px and month about94px. Month summary retains seconds and separates remaining from balance. Browser agent inspected final six-row Settings root320, leave detail390 and Today390; evidence output/playwright/P10/settings-root-six-{320,390}.png, settings-leave-{320,390}.png and current Today screenshots. Root verified the existing user preview was updated through the PWA UI and observed the new six-row Settings. Full-page captures can stitch fixed bottom navigation in the middle; viewport captures are the rendering reference.

Browser checks PASS initial closed layout, Enter/Space disclosure actions, no leave-management trigger/region on Today, requests persisted after reload, session details, leave-day status/calendar P and stopping a previous-day active session on a leave day. Settings checks cover six sections, leave dirty Back→cancel retains input, tab→discard clears draft, nondefault saved range→new untouched form→Back does not falsely prompt, duplicate error→Hủy clears error, and untouched tomorrow form after midnight remains clean. Leave tests retain atomic conflict/ranges/stale/JSON/targets/delete guards and editor return/month coverage. Screenshot review caught a data-slot selector mismatch on the initial prototype; selector corrected to class, build repeated and final tests add bounding-box coverage.

Final full runner PASS app/Today/WFH/holidays/leave/settings plus PWA offline check-in/pause/reload/new window, manifest/icons/scope, reconnect/cache privacy, update routing/dirty guard/cancel/confirm/other-window draft/failed-install rollback and sync fixture startup/local backup/reconnect/realtime/errors/account isolation. No real Firebase project data was written by these checks. P10 remains a local preview, no hosted release.
