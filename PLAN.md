# Kế hoạch và nghiệm thu

## P0 — Foundation
Next/static export, strict TS, shadcn CLI, module/docs, runtime pin, GitHub Actions. Điều kiện: install/lint/typecheck/build.

## P1 — Tracking
Vào/về, pause/resume, office/WFH, request status, automatic lunch once per day, manual add/edit/delete, holidays/leave, settings, exact seconds, daily/weekly/monthly balances, month boundary, JSON/CSV export. Unit edge cases + Playwright Chromium/WebKit/mobile.

## P2 — Firebase and release
Google Auth, private Firestore rules, transactions/version conflict, explicit local/cloud separation and import. Rules emulator tests, docs creation/deploy, GitHub Pages build/deploy, hosted smoke. Firebase thật chưa có project tại thời điểm bắt đầu; không tuyên bố lưu cloud hoạt động trước nghiệm thu.

Mỗi phase có report/test-results/ponytail-review/ponytail-audit. UI thêm frontend-review/ui-review. Trạng thái thực theo docs/phases; không tự gọi nghiệm thu hoàn thành vì source đã có.
