# P9 — Test results

Ngày 11/11/2026. Local static export ở http://127.0.0.1:3140/, cache du-gio-pwa-%2F-02e5265a2158af03. Dùng browser context/guest ledger cô lập; không ghi dữ liệu vào tài khoản Firebase thật.

| Check | Status | Evidence / limit |
| --- | --- | --- |
| Source review | PASS | Đọc diff tracker-app/account-panel/globals và luồng kết nối; không có blocker |
| Unit tests | PASS | npm run test:unit,44 tests/6 files |
| Lint | PASS | npm run lint |
| Typecheck | PASS | npm run typecheck |
| Production build | PASS | npm run build, static export + PWA |
| Firestore Rules emulator | PASS | npm run test:db,2 tests, demo project/Java21; rules không đổi |
| Sync fixture Chromium/WebKit | PASS | npm run test:sync; Auth/transport giả, hook/repository/sync thật |
| Full Playwright Chromium/WebKit | PASS | E2E_PORT=3140 npm run test:e2e, app/WFH/holidays/leave/settings/PWA + sync fixture |
| Offline account axe/overflow320 | PASS | Fresh guest contexts, Chromium/WebKit; ảnh output/playwright/P9/*-account-offline-320.png |
| Hosted P9 | NOT RUN | Chưa deploy tại thời điểm tạo bản ghi |
| Firebase tài khoản thật | NOT RUN | Fixture/local browser không chứng minh sync thật |
| Thiết bị vật lý | NOT RUN | Không có bằng chứng |

Sync fixture xác nhận thông báo đã đồng bộ chỉ hiện tại mục tài khoản; retry/lỗi ẩn tại Hôm nay/Lịch sử/Báo cáo/root Cài đặt/editor. Nút thử lại trong tài khoản thực sự được bấm với transport còn lỗi, bản local được giữ; có mạng trở lại tự đồng bộ khi editor đang có nháp mà không xóa ghi chú. Lưu nháp và trở lại tài khoản xác nhận đã đồng bộ. Source review và root đã xem ảnh Chromium320 output/playwright/P9/chromium-sync-account-error-320.png: nội dung/nút trong panel, không overflow. Ảnh dùng user giả không có email/displayName; không phải bằng chứng đăng nhập thật.

Combined npm run test:e2e exit0: production app/WFH/holidays/leave/settings/PWA và sync fixture PASS cả hai engines. Settings kiểm năm mục, Back/tabs, nháp/cancel/discard/stale-save, tháng lễ, backup reset và axe/overflow320390. PWA kiểm thông báo offline ẩn tại Hôm nay, hiện trong tài khoản, biến mất khi nối mạng; check-in/pause/reload/new window vẫn giữ local. Update fixture vẫn xác nhận/cancel, guard nháp, chỉ reload cửa sổ đồng ý và rollback khi install lỗi.

Fresh guest account offline được kiểm riêng trên Chromium/WebKit: role status đúng nơi, axe WCAG A/AA và overflow320 PASS. Browser agent và root đã xem ảnh Chromium320, nhãn và notice nằm gọn trong panel. Không dùng các kiểm này để xác nhận Firebase thật.
