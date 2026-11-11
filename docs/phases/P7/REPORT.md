# P7 — Lên lịch nghỉ phép

Yêu cầu 10/11/2026: có nơi rõ ràng để đánh dấu trước ngày nghỉ phép, ví dụ ngày mai. Màn Hôm nay có mục Nghỉ phép ngay sau chấm công. Nút Thêm ngày nghỉ phép mở khoảng Từ ngày/Đến ngày mặc định ngày mai Việt Nam, ghi chú tùy chọn; chọn cùng ngày để nghỉ một ngày. Lưu xong thu form và mở danh sách tháng bắt đầu; có sửa và xóa từng ngày. Ngày hiện tại nghỉ phép/lễ hiển thị thông báo thay đồng hồ; lịch tuần đánh dấu P kèm chú giải và accessible label, Lịch sử ghi loại nghỉ và ghi chú.

Tái sử dụng HolidaySettings thành tracking/TimeOffPlanner, dùng cùng addTimeOff/removeTimeOff cho leave/holiday. Không thêm dependency, schema, Firebase rules hoặc công thức tính giờ. Ngày thường nghỉ phép được loại khỏi chỉ tiêu tuần/tháng, không cộng thành giờ đã làm; cuối tuần không giảm thêm. Lưu qua useTracker.save giữ local trước; Firebase vẫn chỉ báo đồng bộ sau server xác nhận.

Nếu bất kỳ ngày trong khoảng đã có dữ liệu, từ chối toàn khoảng và giữ input; không ghi đè ca làm/kế hoạch/nghỉ/lễ. DayEditor xác nhận trước khi bỏ ca văn phòng hoặc WFH cố định khi đổi sang ngày nghỉ. Xóa có xác nhận, kiểm loại ngày và version lúc mở để giữ thay đổi tab khác. Các ngày sau có thể ghi trước; không tạo ca làm tương lai. Form mới tính lại mặc định ngày mai lúc mở kể cả đã qua nửa đêm.

Thiết kế giữ palette, Be Vietnam Pro, max480px, native date và nút shadcn. Form một cột, danh sách có đường kẻ và ghi chú xuống dòng; phần chấm công vẫn là thao tác chính. Không thêm quản lý số dư phép, phép nửa ngày hoặc quy trình duyệt vì chưa được yêu cầu.

Nghiệm thu local và giới hạn ghi tại test-results.md; đánh giá code và giao diện ở các file cùng phase. P7 chưa deploy. Hosted Firebase tài khoản thật và thiết bị vật lý NOT RUN.
