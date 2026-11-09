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

## Kết quả 09/11/2026

P0, P1, P2 đã triển khai và kiểm tra trong phạm vi web cá nhân. Release code03c473f, GitHub Actions42563854172 SUCCESS cả verify-build/deploy. HTTPS full E2E Chromium/WebKit PASS, real Google sign-in trên localhost và Pages PASS, cloud default settings write/read-back PASS. Không thêm ca làm giả vào sổ thật. Link và bằng chứng tại docs/phases/P2. Physical phones và long-session token refresh chưa test, không tuyên bố PASS.

P3 hoàn thành: release d86f37d, Actions42566267095 SUCCESS. Manifest/installability/offline local ledger/safe update/failed install rollback đã kiểm local + hosted theo docs/phases/P3/test-results.md. Chưa kiểm cài app trên thiết bị vật lý.
