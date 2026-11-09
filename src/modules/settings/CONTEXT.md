# CONTEXT — Cài đặt giờ làm

Implemented P1, 09/11/2026. settings-form.tsx với shadcn Input/Label/Button. Daily hours chuyển thành dailyMinutes integer, nghỉ 0..180 phút, WFH 2 hoặc3. Default480/60/3 theo user. Cấu hình thay đổi tính lại toàn lịch sử và có notice trước lưu.

Save dùng app-shell run + tracking data transaction, không báo success sớm. Browser đã kiểm đổi nghỉ60→30, WFH3→2, export JSON và restore60. Native numeric bounds + core validator khi persistence. Chưa có config hiệu lực theo ngày vì user chưa yêu cầu.

P4: help nghỉ trưa nói rõ chỉ áp dụng ngày theo ca; fixed WFH8/10 giờ là giờ ròng và không bị trừ. Cài dailyMinutes vẫn quyết định chỉ tiêu, wfhLimit vẫn đếm số ngày WFH.

P6, 09/11/2026: holiday-settings.tsx thêm mục Ngày nghỉ lễ ở đầu tab Cài đặt. Từ ngày/Đến ngày tính cả hai đầu, cùng tên tùy chọn; nghỉ một ngày chọn hai mốc giống nhau. Tăng ngày bắt đầu qua ngày kết thúc sẽ đưa ngày kết thúc theo. Thêm được ngày tương lai/xuyên tháng/xuyên năm, xem danh sách từng ngày theo tháng với MonthPicker sẵn có, mở DayEditor để sửa và giữ tháng đang xem ở app-shell; xóa từng ngày có AlertDialog và kiểm version tại lúc mở xác nhận. Dùng WorkDay.kind=holiday/note và core addHolidays/removeHoliday, không thêm schema hoặc nguồn dữ liệu riêng. Ngày thường giảm chỉ tiêu theo dailyMinutes; cuối tuần không trừ thêm. Nếu bất kỳ ngày trong khoảng đã có dữ liệu thì từ chối toàn khoảng, giữ input và có nút mở ngày trùng để xem/sửa. Lưu một lần qua useTracker.save nên local-first/sync/error giữ nguyên, chỉ báo thành công sau persist; lỗi đưa focus tới thông báo. Chi tiết nghiệm thu docs/phases/P6; chưa deploy/Firebase thật.
