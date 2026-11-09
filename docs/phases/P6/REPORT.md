# P6 — Quản lý ngày nghỉ lễ

Yêu cầu 09/11/2026: có chỗ dễ tìm để thêm ngày nghỉ lễ trong tháng; một kỳ lễ có thể nhiều ngày. Triển khai mục Ngày nghỉ lễ đầu tab Cài đặt: khoảng Từ ngày/Đến ngày tính cả hai đầu, tên không bắt buộc, thêm trước kỳ nghỉ/xuyên tháng/xuyên năm, danh sách từng ngày theo tháng, mở sửa qua DayEditor và xóa từng ngày qua AlertDialog. Cài đặt thành tab thứ tư ngay sau Báo cáo, bỏ nút bánh răng header.

Dùng nguyên WorkDay.kind=holiday và note cho mỗi ngày, cùng đường save local-first hiện tại. Không đổi schema, Firebase rules, sync, JSON hoặc CSV; không thêm dependency. Core addHolidays kiểm ngày thật/thứ tự trước khi duyệt, clone một lần, từ chối toàn khoảng nếu có bất kỳ ngày đã có dữ liệu, nêu ngày trùng và hướng dẫn mở Chỉnh sửa ngày. Chỉ persist một lần sau validate, không tạo khoảng dở dang. removeHoliday chỉ xóa ngày vẫn là holiday; UI giữ version lúc mở xác nhận và repository kiểm persisted version. Lỗi giữ input và focus thông báo, không báo lưu thành công trước persist. Firebase status vẫn đợi server xác nhận.

Chỉ tiêu tuần/tháng dùng targetSeconds/summarize sẵn có: ngày thường bỏ dailyMinutes khỏi chỉ tiêu, cuối tuần không trừ thêm, không cộng giờ làm giả. Tên lễ lưu trong ghi chú nên xuất/nhập JSON và CSV vẫn dùng được. Thêm khoảng do người dùng chọn, không tự nhập lịch quốc gia hoặc tạo lặp hằng năm.

Giữ palette, Be Vietnam Pro, kích thước chạm44px, bố cục một cột tối đa480px. Danh sách không thêm thẻ con/shadow. Kiểm tra axe phát hiện màu hover80% của primitive Button làm nút chính thiếu contrast; tăng lên90% và kiểm lại ở trạng thái hover.

Chi tiết nghiệm thu trong test-results.md; review/audit và UI trong các file cùng thư mục. Source local, chưa commit/push/deploy. Hosted Firebase thật và thiết bị vật lý không được xem là đã kiểm từ các test cô lập.
