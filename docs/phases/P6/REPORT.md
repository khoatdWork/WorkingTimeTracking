# P6 — Quản lý ngày nghỉ lễ

Yêu cầu 09/11/2026: có chỗ dễ tìm để thêm ngày nghỉ lễ trong tháng; một kỳ lễ có thể nhiều ngày. Triển khai mục Ngày nghỉ lễ đầu tab Cài đặt: khoảng Từ ngày/Đến ngày tính cả hai đầu, tên không bắt buộc, thêm trước kỳ nghỉ/xuyên tháng/xuyên năm, danh sách từng ngày theo tháng, mở sửa qua DayEditor và xóa từng ngày qua AlertDialog. Cài đặt thành tab thứ tư ngay sau Báo cáo, bỏ nút bánh răng header.

Dùng nguyên WorkDay.kind=holiday và note cho mỗi ngày, cùng đường save local-first hiện tại. Không đổi schema, Firebase rules, sync, JSON hoặc CSV; không thêm dependency. Core addHolidays kiểm ngày thật/thứ tự trước khi duyệt, clone một lần, từ chối toàn khoảng nếu có bất kỳ ngày đã có dữ liệu, nêu ngày trùng và hướng dẫn mở Chỉnh sửa ngày. Chỉ persist một lần sau validate, không tạo khoảng dở dang. removeHoliday chỉ xóa ngày vẫn là holiday; UI giữ version lúc mở xác nhận và repository kiểm persisted version. Lỗi giữ input và focus thông báo, không báo lưu thành công trước persist. Firebase status vẫn đợi server xác nhận.

Chỉ tiêu tuần/tháng dùng targetSeconds/summarize sẵn có: ngày thường bỏ dailyMinutes khỏi chỉ tiêu, cuối tuần không trừ thêm, không cộng giờ làm giả. Tên lễ lưu trong ghi chú nên xuất/nhập JSON và CSV vẫn dùng được. Thêm khoảng do người dùng chọn, không tự nhập lịch quốc gia hoặc tạo lặp hằng năm.

Giữ palette, Be Vietnam Pro, kích thước chạm44px, bố cục một cột tối đa480px. Danh sách không thêm thẻ con/shadow. Kiểm tra axe phát hiện màu hover80% của primitive Button làm nút chính thiếu contrast; tăng lên90% và kiểm lại ở trạng thái hover.

Chi tiết nghiệm thu trong test-results.md; review/audit và UI trong các file cùng thư mục. Release87f280d21f7abfcf8319ce8bcd7a0c40871a6d73 đã deploy09/11/2026 lúc15:03:59 ICT. [Actions42582851794](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42582851794) verify-build3m37s/deploy8s SUCCESS, gồm40unit/2Rules/Chromium+WebKit production/PWA/sync fixture. [Pages](https://khoatdwork.github.io/WorkingTimeTracking/) phục vụ cache du-gio-pwa-%2FWorkingTimeTracking%2F-42dd91db1fedace6 khớp build CI. Hosted Firebase thật và thiết bị vật lý không được xem là đã kiểm từ các test cô lập.

Hosted full app/WFH/holiday Chromium+WebKit PASS; Chromium HTTPS offline PWA và WebKit manifest/icons/worker/ready PASS. Context giả cô lập chỉ dùng sổ local, không thêm dữ liệu Firebase thật. App/PWA đang mở có thể nhận bản mới qua Cài đặt → Cài ứng dụng → Cập nhật ứng dụng; đóng hết cửa sổ cũng cho worker áp dụng.
