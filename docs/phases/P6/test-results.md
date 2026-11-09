# P6 test results — 09/11/2026

- `npm run lint`: PASS, không warnings.
- `npm run typecheck`: PASS, Next typegen và TypeScript strict.
- `npm run build`: PASS, static export ở root, 42 public files, PWA cache `du-gio-pwa-%2F-523b4dd3c2dca2cd`.
- `npm run test:unit`: 40 PASS / 5 files. Có 7 bài holiday: một ngày/tương lai, chỉ tiêu tuần/tháng, khoảng bao gồm hai đầu/weekday/weekend, qua tháng/năm/ngày nhuận/biên2100, từ chối ngày đã có dữ liệu giữa khoảng, ngày sai/đảo thứ tự/ghi chú/storage cap, xóa chỉ holiday và khôi phục chỉ tiêu; đầu vào không bị thay đổi.
- `npm run test:db`: 2 PASS trên Firestore emulator, project `demo-working-time`, Temurin Java21 trong `.private` (ignored). Kiểm owner/anonymous/cross-user, version, envelope/settings và fixed WFH; rules/schema không thay đổi. Lần thử đầu chưa trỏ đúng thư mục Java, đã sửa PATH sang JRE có sẵn và chạy lại thành công.
- `APP_URL=http://127.0.0.1:3000/ npm run test:e2e`: PASS, exit0. Chromium + WebKit chạy app production, WFH, holidays, PWA và sync fixture.
- Holiday browser: thêm lễ ngày thường tương lai + cuối tuần, mục tiêu tháng168→160 giờ, reload vẫn giữ, duplicate và ngày WFH đã ghi bị chặn mà giữ input/dữ liệu. Mở sửa ghi chú qua danh sách; JSON export/import roundtrip và CSV giữ loại ngày/tên lễ. Thêm tháng12, sửa xong vẫn xem tháng12; chuyển về tháng11 đúng danh sách. Xóa được hủy; khi tab khác đổi ghi chú, xác nhận cũ bị chặn; xác nhận mới xóa đúng lễ và phục hồi mục tiêu168 giờ, không sửa WFH đã ghi.
- Followup range/navigation: khoảng13–16/11 tạo4 ngày, chỉ giảm2 ngày thường (168→152 giờ), reload giữ nguyên. Khoảng12–17/11 trùng ở giữa bị từ chối, toàn bộ persisted state/version và input không đổi. Khoảng31/12–02/01 tạo đủ3 ngày qua năm mới, danh sách tháng1 đúng. Hôm nay/Lịch sử/Báo cáo/Cài đặt đúng thứ tự, chỉ một nút Cài đặt toàn trang, aria-current đúng, Enter/focus mở Cài đặt được, nav không tràn320px. Chromium/WebKit PASS.
- UI holiday320px: không tràn ngang, axe WCAG A/AA và WCAG2.1AA PASS ở cả hai engines với nút thêm được hover và đang enabled. Lần đầu axe bắt lỗi hover primary80%; đã sửa primitive sang90%, rebuild và chạy lại cả bộ đạt PASS. Đã xem screenshot Chromium320px cuối cùng với form Từ/Đến và4tab; screenshots/exports ở `output/playwright/P6` (ignored).
- Regression: office clock/pause/resume/reload/exact seconds; WFH8/10/request/legacy/conversion/future plans; reports/settings/export/import/stale editor; 5 viewport widths và axe PASS Chromium/WebKit. PWA manifest/icons/scope/offline/reopen/cache privacy/reconnect PASS hai engines; update confirm/cancel và failed-install rollback PASS Chromium. Sync fixture startup pull/local backup/offline reopen/reconnect upload/realtime pull/server failure/account isolation PASS hai engines.
- In-app browser local preview: cache cũ còn form một ngày/header gear. Đã dùng luồng Cài ứng dụng → Cập nhật ứng dụng → Cập nhật và tải lại; sau đó quan sát tab Cài đặt thứ4 và form Từ ngày/Đến ngày mới. Không thêm hoặc sửa bản ghi người dùng trong preview.

Các browser context cô lập dùng dữ liệu giả lưu local. Sync dùng Auth/transport fixture; Rules dùng emulator. Không ghi dữ liệu giả lên Firebase production.

Firebase tài khoản thật cho thay đổi này và thiết bị vật lý: **NOT RUN**. Local kiểm root build; CI kiểm subpath/WorkingTimeTracking cùng toàn bộ suite. Review/audit không phát hiện lỗi chặn trong phạm vi thay đổi.

## Release evidence

- Source87f280d21f7abfcf8319ce8bcd7a0c40871a6d73, [Actions42582851794](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42582851794) SUCCESS: verify-build3m37s, deploy8s, kết thúc09/11/2026 lúc15:03:59 ICT.
- CI Ubuntu: npm ci/lint/typecheck/40unit/2Rules/Pages subpath build/full production E2E Chromium+WebKit/PWA/sync fixture PASS. PWA cache du-gio-pwa-%2FWorkingTimeTracking%2F-42dd91db1fedace6.
- Hosted HTTP: trang chính200, manifest200 đúng application/manifest+json, sw.js200 đúng application/javascript và cache khớp CI. tests/e2e/sync-fixture.html404.
- Hosted `APP_URL=https://khoatdwork.github.io/WorkingTimeTracking/ node scripts/e2e.mjs`: PASS exit0. App/WFH/holiday regression Chromium+WebKit PASS, gồm range bao gồm hai đầu, atomic rejection, qua năm mới, chỉ tiêu đúng,4tab/keyboard, stale delete, JSON/CSV,320px và hovered-button axe. Chromium HTTPS PWA manifest/installability/offline/reload/new window/reconnect/cache privacy PASS. WebKit hosted PWA manifest/icons/worker/ready PASS; offline navigation vẫn kiểm bằng local server refusal theo giới hạn đã ghi P3.
- Browser hosted chạy context cô lập chưa đăng nhập; không ghi Firebase production. Log `output/verification/P6-hosted-e2e.log` và screenshots `output/playwright/P6` ignored. Kết quả này xác nhận app/PWA release; không xác nhận sync tài khoản Firebase thật.
