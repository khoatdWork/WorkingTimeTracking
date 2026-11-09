# Kế hoạch và nghiệm thu

## P0 — Foundation
Next/static export, strict TS, shadcn CLI, module/docs, runtime pin, GitHub Actions. Điều kiện: install/lint/typecheck/build.

## P1 — Tracking
Vào/về, pause/resume, office/WFH, request status, automatic lunch once per day, manual add/edit/delete, holidays/leave, settings, exact seconds, daily/weekly/monthly balances, month boundary, JSON/CSV export. Unit edge cases + Playwright Chromium/WebKit/mobile.

## P2 — Firebase and release
Google Auth, private Firestore rules, transactions/version conflict, explicit local/cloud separation and import. Rules emulator tests, docs creation/deploy, GitHub Pages build/deploy, hosted smoke. Firebase thật chưa có project tại thời điểm bắt đầu; không tuyên bố lưu cloud hoạt động trước nghiệm thu.

Mỗi phase có report/test-results/ponytail-review/ponytail-audit. UI thêm frontend-review/ui-review. Trạng thái thực theo docs/phases; không tự gọi nghiệm thu hoàn thành vì source đã có.

## P3 — PWA
Manifest và PNG icons (regular/maskable/Apple), standalone + safe areas, service worker theo basePath với cache phiên bản từ nội dung build. Giao diện và sổ thiết bị dùng offline; Firebase không có queue ghi offline. Cài đặt có hướng dẫn cài app, trạng thái offline, cập nhật có xác nhận và không reload bản nháp tab khác. Nghiệm thu: installability Chromium, offline/reopen/local persistence, update/failed install, cache scope/privacy, regression Chromium/WebKit, CI và hosted smoke. Xem docs/phases/P3.

## P4 — WFH cố định
Theo yêu cầu mới: WFH chỉ chọn8/10 giờ ròng, không tracking ca hoặc trừ thêm nghỉ trưa. Cập nhật Today/editor, core validation/totals, JSON/CSV, tests. Legacy ca giữ nguyên đến khi người dùng xác nhận đổi; tương lai không ghi giờ, chặn mixed/cross-midnight double count. Nghiệm thu theo docs/phases/P4.

## P5 — Bản local và tự đồng bộ Firebase

Thay mô hình hai sổ P2/P3 theo yêu cầu09/11/2026: mọi lần lưu giữ local trước; mỗi lần mở app/đăng nhập/có mạng trở lại tự sync. Chưa có local lấy Firebase; local chưa đồng bộ ưu tiên tải lên, local sạch nhận thay đổi Firebase. Local tách uid, nhận guest local một lần, transaction vẫn kiểm version trước ghi và chỉ báo đồng bộ sau server xác nhận. Nghiệm thu startup/offline/reopen/reconnect/server error/auth switch/real-time updates; báo cáo docs/phases/P5. Đã deploy ce5a39a; hosted app/PWA regression PASS, sync Firebase tài khoản thật P5 chưa nghiệm thu.

## P6 — Quản lý ngày nghỉ lễ

Thêm mục Ngày nghỉ lễ tại tab Cài đặt: khoảng Từ ngày/Đến ngày tính cả hai đầu, tên tùy chọn, danh sách theo tháng, mở sửa và xóa từng ngày có xác nhận. Cài đặt là tab thứ tư sau Báo cáo, bỏ nút header. Tái sử dụng WorkDay.kind=holiday/note để chỉ tiêu tuần/tháng tự loại ngày lễ, không trừ thêm cuối tuần. Không ghi đè ngày đã có dữ liệu: trùng bất kỳ ngày nào thì từ chối toàn khoảng; xóa kiểm version tránh mất thay đổi tab khác. Nghiệm thu lint/typecheck/build, unit, Firestore emulator và Playwright Chromium/WebKit/axe/export/import/stale tab/range/cross-year/four-tab navigation. Báo cáo docs/phases/P6; chưa deploy.

## Kết quả 09/11/2026

P0, P1, P2 đã triển khai và kiểm tra trong phạm vi web cá nhân. Release code03c473f, GitHub Actions42563854172 SUCCESS cả verify-build/deploy. HTTPS full E2E Chromium/WebKit PASS, real Google sign-in trên localhost và Pages PASS, cloud default settings write/read-back PASS. Không thêm ca làm giả vào sổ thật. Link và bằng chứng tại docs/phases/P2. Physical phones và long-session token refresh chưa test, không tuyên bố PASS.

P3 hoàn thành: release d86f37d, Actions42566267095 SUCCESS. Manifest/installability/offline local ledger/safe update/failed install rollback đã kiểm local + hosted theo docs/phases/P3/test-results.md. Chưa kiểm cài app trên thiết bị vật lý.

P4 hoàn thành: release9377631, Actions42568082493 SUCCESS.22unit +2Rules tests, browser regression/WFH8/10/PWA local và hosted PASS; chi tiết docs/phases/P4/test-results.md. Dữ liệu cloud thật không bị thêm giờ giả.

P5 đã deploy: release ce5a39a, Actions42571234030 verify-build/deploy SUCCESS.33unit +2Rules tests, browser production/sync fixture Chromium/WebKit PASS. Hosted HTTPS app/WFH/PWA regression và smoke copy/local initialization PASS; chưa kiểm sync tài khoản Firebase thật hoặc thiết bị vật lý. Chi tiết docs/phases/P5.
