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
| CI verify-build/deploy | PASS | Actions42949633931, source b1e641e,4m39s/9s |
| Hosted app/settings Chromium/WebKit | PASS | Fresh guest contexts, root/chi tiết và hồi quy/axe320390 |
| Hosted Chromium HTTPS PWA | PASS | Manifest/installability/offline/persistence/account notice/reconnect/cache privacy |
| Hosted WebKit PWA smoke | PASS | Manifest/icons/worker/ready; hosted offline navigation NOT RUN |
| Firebase tài khoản thật | NOT RUN | Fixture/local browser không chứng minh sync thật |
| Thiết bị vật lý | NOT RUN | Không có bằng chứng |

Sync fixture xác nhận thông báo đã đồng bộ chỉ hiện tại mục tài khoản; retry/lỗi ẩn tại Hôm nay/Lịch sử/Báo cáo/root Cài đặt/editor. Nút thử lại trong tài khoản thực sự được bấm với transport còn lỗi, bản local được giữ; có mạng trở lại tự đồng bộ khi editor đang có nháp mà không xóa ghi chú. Lưu nháp và trở lại tài khoản xác nhận đã đồng bộ. Source review và root đã xem ảnh Chromium320 output/playwright/P9/chromium-sync-account-error-320.png: nội dung/nút trong panel, không overflow. Ảnh dùng user giả không có email/displayName; không phải bằng chứng đăng nhập thật.

Combined npm run test:e2e exit0: production app/WFH/holidays/leave/settings/PWA và sync fixture PASS cả hai engines. Settings kiểm năm mục, Back/tabs, nháp/cancel/discard/stale-save, tháng lễ, backup reset và axe/overflow320390. PWA kiểm thông báo offline ẩn tại Hôm nay, hiện trong tài khoản, biến mất khi nối mạng; check-in/pause/reload/new window vẫn giữ local. Update fixture vẫn xác nhận/cancel, guard nháp, chỉ reload cửa sổ đồng ý và rollback khi install lỗi.

Fresh guest account offline được kiểm riêng trên Chromium/WebKit: role status đúng nơi, axe WCAG A/AA và overflow320 PASS. Browser agent và root đã xem ảnh Chromium320, nhãn và notice nằm gọn trong panel. Không dùng các kiểm này để xác nhận Firebase thật.

## Release follow-up — 11/11/2026

Source b1e641ec6dd656a10cb9262c9423df291a70cd52. [Actions42949633931](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42949633931) verify-build4m39s/deploy9s SUCCESS, deploy hoàn tất10:03:43ICT. CI chạy lint/typecheck/44unit/2Rules/build/full E2E Chromium+WebKit với basePath /WorkingTimeTracking/.

Hosted main/manifest/sw trả200; sync-fixture.html trả404. Manifest id/scope/start_url đều /WorkingTimeTracking/, display standalone, lang vi. Cache du-gio-pwa-%2FWorkingTimeTracking%2F-13ad89bf21be6143 khớp log CI.

HOSTED_RELEASE=b1e641e python output/verification/P9/run_hosted.py app/settings/pwa (từng suite) PASS. App và Settings hai engines giữ các hồi quy hiện có; Settings xác nhận root không có storage-label, nội dung lưu trữ chỉ trong tài khoản, axe/overflow320390. Root đã xem hosted Chromium account320 và WebKit root390; browser agent xem root/account320, không thấy clipping/overflow. Bằng chứng ignored output/playwright/hosted-b1e641e/{app,settings,pwa}/.

Hosted Chromium HTTPS PWA PASS offline check-in/pause/reload/new window, notice offline chỉ hiện tại tài khoản, reconnect xóa notice và cache privacy. Hosted WebKit chỉ manifest/icons/worker/ready smoke; offline navigation NOT RUN vì giới hạn automation, được kiểm tương đương bằng local server từ chối mạng. Update/cancel/rollback giữ bằng chứng local+CI fixture, chưa kiểm update thực trên thiết bị vật lý.

Mọi hosted context đều guest cô lập; không đăng nhập, import/reset hoặc ghi giờ vào Firebase tài khoản thật. Firebase thật và iPhone/Android vật lý NOT RUN.
