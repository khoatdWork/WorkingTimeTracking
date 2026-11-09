# P5 — Luôn giữ bản local và tự đồng bộ Firebase

Yêu cầu09/11/2026: dữ liệu luôn có bản local. Mỗi lần mở app, có mạng và đã đăng nhập thì sync hai phía; chưa có local tải Firebase về, local chưa đồng bộ tải lên. Cập nhật này thay quy tắc hai sổ độc lập của P2/P3 theo yêu cầu mới, không thay phép tính giờ/WFH.

Thực hiện: local-first repository theo uid, nhận guest local một lần; dirty/cloudVersion persist qua reopen. Hook mở local trước, sync lúc startup/auth/online/focus/visible và khi Firebase có snapshot server mới. UI hiển thị rõ lưu local, chờ/đang/đã đồng bộ; Firebase lỗi không khóa sổ local. Retry giữ nguyên bản nháp. Server reads không lấy cache làm xác nhận; writes vẫn transaction/version/owner-only Rules. Chỉ clear pending sau Firebase ack.

Chính sách khi cả hai phía thay đổi: ưu tiên toàn bộ sổ local chưa đồng bộ theo yêu cầu, không merge từng ngày. Local sạch nhận cập nhật cloud để không đẩy bản cũ đè thay đổi từ thiết bị khác. Xóa/import cũng lưu local trước rồi sync, nên xóa đã xác nhận không bị cloud phục hồi. Local version độc lập cloud version để acknowledgement không làm stale draft. Guest và mỗi uid có local riêng để tránh upload dữ liệu tài khoản trước sang tài khoản sau.

Phạm vi source: tracking/data, account/PWA copy, app-shell status/help, CONTEXT/AGENT/PLAN/README, tests. Không thêm dependency; dùng Vite đã có qua Vitest cho fixture browser, không đưa fixture vào Next static export. CI test:e2e chạy cả regression production và sync fixture.

Kiểm tra: xem test-results.md và các báo cáo review/audit/UI. Bằng chứng cloud thật ở P2 là lịch sử, không được dùng thay nghiệm thu P5.

Released09/11/2026: source ce5a39a36c17d32f01422d7a49a754b7e1524742, [Actions42571234030](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42571234030) verify-build và deploy SUCCESS. [Pages](https://khoatdwork.github.io/WorkingTimeTracking/) phục vụ cache du-gio-pwa-%2FWorkingTimeTracking%2F-4d43e61fb1621ccd. Hosted app/WFH regression Chromium/WebKit PASS, Chromium offline PWA/manifest và WebKit hosted worker/manifest smoke PASS. Smoke riêng kiểm help local-first mới, tự tạo local lúc mở app và fixture không được publish (404).

Chưa kiểm sync bằng tài khoản Firebase thật cho P5 hoặc thiết bị vật lý. Không thêm giờ giả vào Firebase thật. App/PWA đang cài cần Cài đặt → Cài ứng dụng → Cập nhật ứng dụng để nhận bản mới; đóng hết cửa sổ cũng cho phép worker mới áp dụng.
