# P3 tests

Local production build dùng Firebase web config thật + basePath /WorkingTimeTracking. Browser contexts riêng, chưa đăng nhập, chỉ tạo sổ local giả.

- Lint/typecheck: PASS.
- Unit: 17 PASS, gồm cloud read/write offline fail ngay và không gọi Firebase client/transaction.
- Build: PASS, manifest static + worker có scope đúng và 42 public shell/assets, khoảng 1.7 MB chưa nén.
- Regression Chromium/WebKit: exact-second clock, pause/reload/resume, WFH/manual edit/reports, settings/export/import, draft/conflict, 5 widths, axe PASS. Clock test cho scheduler chạy sau cache navigation trước assertion hydration.
- Chromium PWA: native Page.getInstallabilityErrors không có lỗi; manifest/id/scope/start_url, MIME/icon dimensions, worker control, offline check-in/pause/reload/new-window/home-link, saved ledger after reconnect, cache URL/privacy, Settings axe320 PASS.
- WebKit PWA: same local manifest/cache/storage tests PASS với localhost fixture từ chối tất cả network responses khi offline. Playwright context.set_offline chặn navigation trước worker và trả internal error; đã tái hiện riêng, và đối chiếu bằng server shutdown hoàn toàn: offline reload/new-window vẫn PASS. Offline status event được kiểm trước khi dùng server fixture. Không gọi giới hạn simulator này là Safari failure.
- Update two-release fixture: PASS, worker chờ xác nhận, hủy giữ input Settings, chỉ cửa sổ đồng ý reload, tab khác giữ bản nháp, sổ/version và cache app khác giữ nguyên. Release thiếu tệp precache install thất bại, cache dở bị xóa, bản trước vẫn mở offline được.
- Final full local suite: PASS17 unit + regression Chromium/WebKit + PWA/offline/update/rollback. Firestore emulator/CI/hosted results được ghi bên dưới sau khi hoàn tất.
- Firestore emulator: PASS2 tests (owner/anonymous/cross-owner/validation/version assertions), portable Java21, không sửa Rules.
- Physical phones/install/standalone Google popup: NOT RUN; browser diagnostics không thay thế kiểm thiết bị thật.
