# P4 — WFH chọn 8 hoặc 10 giờ

Yêu cầu: ngày WFH chỉ chọn8/10 giờ, không tracking giờ vào/về. Thực hiện bằng WorkDay.wfhHours optional, số giờ ròng không trừ nghỉ trưa. Today chọn và lưu ngay, editor hỗ trợ sửa ngày cũ; tổng ngày/tuần/tháng dùng chung workedSeconds. Request WFH và giới hạn số ngày giữ nguyên.

Tương thích: không tự làm tròn/chuyển ca WFH cũ. Sửa request/note legacy giữ timestamp; chọn fixed hours thay ca sau AlertDialog, hủy giữ nháp và sổ cũ. Đổi fixed WFH sang office/nghỉ xác nhận trước. JSON/local/Firebase giữ field mới, CSV có cột giờ WFH riêng, không tạo ca giả. Chỉ ngày đã đến được ghi giờ; ngày tương lai chỉ lên kế hoạch/request. Chặn trùng giữa fixed day và ca qua nửa đêm.

Không đổi Firestore envelope/Rules, không queue cloud offline. Dữ liệu kiểm thử chỉ ở context local và emulator, không thêm giờ vào sổ Firebase thật. Test/review và release theo test-results.md. Cần cập nhật các tab/PWA trên thiết bị khác trước khi sửa giờ WFH mới; bản app cũ chưa hiểu field này.
