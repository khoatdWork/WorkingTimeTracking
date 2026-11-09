# CONTEXT — Quy tắc giờ và ngày

Implemented 09/11/2026, P1. `domain.ts` là nguồn duy nhất tính giờ, ngày VN, chỉ tiêu, bù giờ, WFH, validation và start/stop.

Contract: TrackerState schema 1, version integer, settings dailyMinutes/lunchMinutes/wfhLimit; days map YYYY-MM-DD, WorkDay có mode/request/kind/sessions/note. Timestamp epoch milliseconds, tổng giây nguyên. Không cộng giờ tương lai. Một ca đang chạy toàn sổ, ca không overlap, ca đã kết thúc <=24 giờ. Sessions theo ngày bắt đầu; phép tính gross chia qua nửa đêm. Nghỉ trưa trừ một lần trên mỗi ngày, pause là nghỉ thêm. Week Monday–Sunday, target weekdays trừ leave/holiday. Dư thiếu chỉ trong tập ngày caller truyền; reports truyền đúng tháng, không kéo tháng trước vào.

16 unit tests gồm domain + repository đã PASS, chi tiết docs/phases/P1/test-results.md. Phụ thuộc pure TS/Intl, không gọi Firebase/React. Callers overview/history/reports/editor/data; đổi contract phải cập nhật tất cả và rules nếu đổi shape.

Giới hạn: đồng hồ thiết bị, timezone VN cố định, ngày lễ tự đánh dấu, config tính lại toàn lịch sử. Storage cap 850 KB. Đã dùng Ponytail full/review/audit đọc snapshot tham chiếu, không cài plugin hệ thống.
