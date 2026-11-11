# P10 — Hôm nay gọn hơn

Release51dd10f617059c05c8609191784e6ff21de18ecf đã deploy tại https://khoatdwork.github.io/WorkingTimeTracking/. Actions https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42956539128 verify-build5m15s và deploy12s SUCCESS, hoàn tất11/11/2026 lúc11:07:23ICT. Toàn bộ kiểm tra CI và hosted regression Chromium/WebKit PASS; Chromium HTTPS offline PWA và WebKit manifest/worker smoke PASS. Cache live486b77e47d3fad89 khớp CI. Root/agent xem ảnh hosted. Firebase tài khoản thật/thiết bị vật lý NOT RUN. Các đoạn local/chưa deploy bên dưới ghi lịch sử trước release.

Điều chỉnh tiếp11/11/2026: khi ngày hiện tại nghỉ phép, Today hiện thẻ xanh với tiêu đề24px “Hôm nay bạn nghỉ phép”, ghi chú rõ và pill theo loại ngày. Lễ vẫn dùng nhãn riêng, ca hôm trước giữ cảnh báo/nút kết thúc, nút sửa luôn có. Lint/typecheck/build44unit/2Rules và targeted Today/leave Chromium+WebKit PASS sau sửa. Root/agent xem ảnh320390, axe/overflow/bbox PASS. Bản local đã cập nhật qua PWA UI; chưa deploy.

Ngày 11/11/2026. Người dùng nhận xét trang Hôm nay có quá nhiều nội dung, yêu cầu bố cục gọn và chỉn chu nhưng giữ chức năng.

Thiết kế giữ Be Vietnam Pro, một cột mobile và palette #F4F7FB, #FFFFFF, #152B46, #53657B, #2257C7, #D8E1EC. Ưu tiên ngày/trạng thái, số giờ và hành động chấm công. Vòng đồng hồ văn phòng thu còn 212px, 200px ở màn nhỏ; WFH cố định dùng số giờ gọn, không có vòng thời gian. Giảm nhãn/lời giải thích lặp lại.

Tuần, tháng và danh sách ca chuyển thành các hàng tóm tắt có thể mở chi tiết. Request WFH nằm cùng vùng chấm công, giữ trạng thái hiện tại khi đóng. Tóm tắt tuần giữ cảnh báo request/giới hạn; tháng tách rõ còn lại cả tháng và dư/thiếu đến hôm nay, hiển thị giây. Cảnh báo ca từ ngày trước và nút kết thúc vẫn hiện ngoài phần thu gọn, kể cả ngày nghỉ.

Dùng primitive shadcn/Radix Collapsible. State mở được giữ tại shell để quay lại từ DayEditor không đóng các phần đang xem; nội dung đóng ẩn bằng display:none. Theo yêu cầu tiếp trong cùng phase, toàn bộ quản lý nghỉ phép chuyển sang Cài đặt → Nghỉ phép, trước Ngày nghỉ lễ. Dùng TimeOffPlanner hiện có và guard giữ/bỏ nháp, giữ mục/tháng khi quay lại từ editor. Mở form mới reset baseline theo ngày mai hiện tại; Hủy xóa lỗi để không báo nháp/lỗi cũ. Hôm nay vẫn phản ánh ngày nghỉ đã lưu và P trên lịch tuần. Không đổi nghiệp vụ, schema, core hoặc đồng bộ.

Source review, lint/typecheck/build,44unit và2Rules emulator PASS sau điều chỉnh. Final full npm run test:e2e Chromium+WebKit PASS, gồm tất cả suite production/PWA/sync fixture. Root và browser agent đã xem ảnh cuối. Màn office giảm từ1739/1766 xuống921/933px (~47%), WFH2049/2052 xuống956px (~53%), chạy ca giảm~47% tại320/390 trên viewport844px. Hàng full-width ít nhất64px, không overlap, axe/overflow PASS. P10 là bản thử local, chưa deploy; Firebase thật và thiết bị vật lý NOT RUN. Kết quả cuối tại test-results.md.
