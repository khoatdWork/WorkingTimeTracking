# Quy tắc làm việc

Cấu trúc tham chiếu E:/QuanLyTaiSan, đã đọc AGENTS.md, AGENT.md, Design.md, README.md và module CONTEXT ngày 09/11/2026.
Giữ Next.js App Router/static export, React, TypeScript strict, shadcn/ui (Radix Nova), Be Vietnam Pro, module CONTEXT và báo cáo phase. Firebase thay Supabase theo yêu cầu; GitHub Pages thay Cloudflare. Không mang quy tắc tài chính riêng sang app giờ.

- Ngày nghiệp vụ Asia/Ho_Chi_Minh. Timestamp UTC, phép tính bằng giây nguyên. Thứ 2–6, 480 phút/ngày, mặc định trừ 60 phút nghỉ với ngày ghi theo ca. WFH chọn 8 hoặc 10 giờ làm ròng, không tính giờ vào/về hoặc trừ thêm nghỉ trưa; tối đa 3 ngày/tuần. Giữ ca WFH cũ đến khi người dùng xác nhận chuyển. Cài đặt có hiệu lực cho toàn bộ báo cáo, UI phải nói rõ.
- Dư/thiếu bù trong cùng tháng; số còn phải làm cả tháng phải tách số thiếu đến hôm nay. Cuối tuần vẫn ghi giờ bù, không tự thêm mục tiêu. Nghỉ/lễ đánh dấu thủ công.
- Firebase Auth Google; Firestore owner-only rules, version transaction cho ghi, phát hiện chỉnh sửa đồng thời, không ghi offline ngầm.
- Local mode là dữ liệu trên thiết bị, nhãn rõ, export JSON để backup; không trộn với cloud. Import chỉ do người dùng bấm.
- Không tự gửi WFH request cho công ty. App chỉ ghi trạng thái người dùng đã gửi/chấp thuận.
- shadcn CLI cho primitive phù hợp; custom chỉ bố cục và nghiệp vụ. Dùng frontend-design, web-design-guidelines, Playwright/webapp-testing, Ponytail full/review/audit đọc trực tiếp từ snapshot project tham chiếu.
- Lỗi giữ input; xóa/xóa dữ liệu xác nhận bằng AlertDialog. Không ghi thành công trước khi persist. Mỗi module có CONTEXT, mỗi phase có test/review/audit, nêu giới hạn thật.
