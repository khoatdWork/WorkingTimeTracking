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

Thêm mục Ngày nghỉ lễ tại tab Cài đặt: khoảng Từ ngày/Đến ngày tính cả hai đầu, tên tùy chọn, danh sách theo tháng, mở sửa và xóa từng ngày có xác nhận. Cài đặt là tab thứ tư sau Báo cáo, bỏ nút header. Tái sử dụng WorkDay.kind=holiday/note để chỉ tiêu tuần/tháng tự loại ngày lễ, không trừ thêm cuối tuần. Không ghi đè ngày đã có dữ liệu: trùng bất kỳ ngày nào thì từ chối toàn khoảng; xóa kiểm version tránh mất thay đổi tab khác. Lint/typecheck/build,40unit,2Rules và Playwright Chromium/WebKit/axe/export/import/stale tab/range/cross-year/four-tab navigation PASS. Đã deploy87f280d, Actions42582851794 SUCCESS; báo cáo docs/phases/P6. Firebase tài khoản thật cho P6 và thiết bị vật lý NOT RUN.

## P7 — Lên lịch nghỉ phép

Yêu cầu 10/11/2026: có chỗ dễ tìm để đánh dấu trước ngày nghỉ phép, ví dụ ngày mai. Thêm mục Nghỉ phép tại Hôm nay, mở form khoảng ngày mặc định ngày mai, ghi chú tùy chọn, xem/sửa/xóa theo tháng. Tái sử dụng trình quản lý nghỉ lễ thành TimeOffPlanner và addTimeOff/removeTimeOff, giữ WorkDay.kind=leave/holiday và schema hiện có. Ngày nghỉ hiện tại thay đồng hồ bằng trạng thái rõ ràng; ngày nghỉ phép có ký hiệu P trên tuần. Từ chối nguyên khoảng trùng dữ liệu; chuyển ca văn phòng sang ngày nghỉ có xác nhận. Lint/typecheck/build,44unit/2Rules emulator và full E2E Chromium/WebKit app/WFH/holiday/leave/settings/PWA/sync fixture PASS trên CI. Deploy ecf7375, Actions42946545547 SUCCESS11/11/2026 lúc09:36:05ICT. Hosted regression Chromium/WebKit PASS; Firebase tài khoản thật/thiết bị vật lý NOT RUN. Chi tiết docs/phases/P7.

## P8 — Cài đặt dạng danh sách

Yêu cầu10/11/2026: màn Cài đặt gọn theo kiểu iPhone, chạm từng mục mới chỉnh. Ba nhóm, năm mục Tài khoản & đồng bộ/Quy tắc giờ làm/Ngày nghỉ lễ/Cài ứng dụng/Bản sao lưu; mở một màn chi tiết và Quay lại Cài đặt, giữ bốn tab dưới. Tái sử dụng panel và đường lưu hiện tại. Nhắc bỏ nháp khi quay lại/đổi tab/mở cập nhật/sửa ngày lễ, giữ nháp khi lưu lỗi hoặc cài đặt đổi ở tab khác. PWA notice mở thẳng mục Cài ứng dụng. Lint/typecheck/build,44unit/2Rules emulator và full E2E Chromium/WebKit app/WFH/holidays/leave/settings/PWA/sync fixture PASS trên CI. Deploy cùng P7 tại ecf7375, Actions42946545547 SUCCESS11/11/2026 lúc09:36:05ICT; hosted Settings/leave/holiday/app/WFH Chromium+WebKit và HTTPS PWA smoke PASS. Chi tiết docs/phases/P8; Firebase tài khoản thật/thiết bị vật lý NOT RUN.

## P9 — Trạng thái lưu trữ trong Cài đặt

Yêu cầu11/11/2026: chuyển nhãn nơi lưu, thông báo mất mạng và trạng thái local/Firebase vào Cài đặt → Tài khoản & đồng bộ, giữ nút thử lại cùng trạng thái. Không đổi persistence hoặc điều kiện xác nhận Firebase. Deploy b1e641e, Actions42949633931 SUCCESS11/11/2026 lúc10:03:43ICT. Lint/typecheck/build,44unit/2Rules/full E2E Chromium+WebKit PASS local và CI; hosted app/settings hai engines, Chromium offline HTTPS PWA và WebKit worker smoke PASS. Firebase tài khoản thật/thiết bị vật lý NOT RUN. Chi tiết docs/phases/P9.

## P10 — Hôm nay gọn hơn

Đã deploy51dd10f, Actions42956539128 verify-build5m15s/deploy12s SUCCESS11/11/2026 lúc11:07:23ICT. CI lint/typecheck/build44unit/2Rules/full E2E Chromium+WebKit PASS. Hosted app/Today/WFH/holidays/leave/settings hai engines, Chromium HTTPS offline PWA và WebKit manifest/worker smoke PASS. Cache du-gio-pwa-%2FWorkingTimeTracking%2F-486b77e47d3fad89 khớp CI. Bằng chứng docs/phases/P10; Firebase tài khoản thật/thiết bị vật lý NOT RUN. Phần bản thử dưới đây là lịch sử trước deploy.

Yêu cầu11/11/2026: Hôm nay thu gọn chấm công, ghép request vào WFH, nhóm tuần/tháng/ca thành hàng tóm tắt mở chi tiết. Theo yêu cầu tiếp cùng phase, chuyển toàn bộ quản lý nghỉ phép sang Cài đặt → Nghỉ phép, dùng guard giữ/bỏ nháp và giữ mục/tháng sau editor. Ngày nghỉ hôm nay có thẻ nổi bật, tiêu đề24px/ghi chú và pill ưu tiên loại ngày, giữ xử lý ca hôm trước. Không đổi nghiệp vụ. Local preview lint/typecheck/build44unit/2Rules/full E2E Chromium+WebKit PASS; màn ngắn hơn47–53%, axe/overflow/bbox320390 PASS. Sau điều chỉnh thẻ nghỉ, chạy lại lint/typecheck/build44unit/2Rules và targeted Today/leave Chromium+WebKit PASS. Bằng chứng docs/phases/P10; chưa deploy, Firebase thật/thiết bị vật lý NOT RUN.

## Kết quả 09/11/2026

P0, P1, P2 đã triển khai và kiểm tra trong phạm vi web cá nhân. Release code03c473f, GitHub Actions42563854172 SUCCESS cả verify-build/deploy. HTTPS full E2E Chromium/WebKit PASS, real Google sign-in trên localhost và Pages PASS, cloud default settings write/read-back PASS. Không thêm ca làm giả vào sổ thật. Link và bằng chứng tại docs/phases/P2. Physical phones và long-session token refresh chưa test, không tuyên bố PASS.

P3 hoàn thành: release d86f37d, Actions42566267095 SUCCESS. Manifest/installability/offline local ledger/safe update/failed install rollback đã kiểm local + hosted theo docs/phases/P3/test-results.md. Chưa kiểm cài app trên thiết bị vật lý.

P4 hoàn thành: release9377631, Actions42568082493 SUCCESS.22unit +2Rules tests, browser regression/WFH8/10/PWA local và hosted PASS; chi tiết docs/phases/P4/test-results.md. Dữ liệu cloud thật không bị thêm giờ giả.

P5 đã deploy: release ce5a39a, Actions42571234030 verify-build/deploy SUCCESS.33unit +2Rules tests, browser production/sync fixture Chromium/WebKit PASS. Hosted HTTPS app/WFH/PWA regression và smoke copy/local initialization PASS; chưa kiểm sync tài khoản Firebase thật hoặc thiết bị vật lý. Chi tiết docs/phases/P5.

P6 đã deploy: release87f280d, Actions42582851794 verify-build/deploy SUCCESS.40unit +2Rules, full E2E Chromium/WebKit production/PWA/sync fixture PASS. Hosted app/WFH/holiday ranges/four-tab navigation/axe hai engines PASS, Chromium HTTPS offline PWA và WebKit manifest/worker smoke PASS. Firebase tài khoản thật P6 và thiết bị vật lý NOT RUN. Chi tiết docs/phases/P6.
