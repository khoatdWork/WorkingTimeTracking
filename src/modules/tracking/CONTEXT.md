# CONTEXT — Chấm công, lịch sử và báo cáo

Implemented P1, 09/11/2026. overview.tsx chấm công hôm nay, WFH/request, vòng giờ, tuần/tháng và ca. history.tsx lọc tháng/WFH/thiếu; reports.tsx tổng tháng + tuần giới hạn trong tháng + bar chart; month-picker.tsx dùng Input type month; day-editor.tsx thêm/sửa/xóa ca, location, request, nghỉ/lễ và note.

UI lấy mọi phép tính từ core. Lưu qua hook save callback. Editor giữ baseline version để không ghi đè draft stale, beforeunload + AlertDialog khi rời, delete xác nhận. Validation input giữ lại khi lỗi. Có thể lập kế hoạch WFH/nghỉ tương lai, không tạo ca làm tương lai.

shadcn CLI: Button/Input/Label/Textarea/Badge/AlertDialog/Sonner. Chart là SVG circle/CSS bars vì là tiến độ đơn giản có số giờ kèm và accessible label; không cần thêm chart dependency. Segmented buttons native aria-pressed tạo composition từ shadcn, không tự viết primitive.

Playwright Chromium/WebKit đã kiểm 320/360/390/430/1280px và axe WCAG A/AA trên 3 màn chính. Screenshots output/playwright/P1 (ignored). Dữ liệu test giả, không ghi Firebase. Skill frontend-design/web-design-guidelines + Python webapp-testing; CLI reconnaissance không chạy được do máy thiếu Chrome channel, đã dùng bundled Playwright browsers với Python. Chi tiết test-results và review trong docs/phases/P1.

P4: WFH mới không có nút vào/về. Today chọn 8/10 giờ lưu ngay qua run; hiển thị số giờ cố định và request như trước. Editor WFH chỉ chọn giờ + request/note, không có datetime inputs. Ngày tương lai chỉ kế hoạch/request. Legacy sessions không tự đổi: request/note giữ nguyên ca, chọn giờ rồi Lưu mở AlertDialog trước khi thay; đổi fixed WFH sang office/nghỉ cũng xác nhận. Xem P4 tests/reviews. Tổng History/Reports lấy workedSeconds nên không có phép cộng WFH riêng ở UI.

P6: mục Ngày nghỉ lễ trong tab Cài đặt tạo một WorkDay kind=holiday cho mỗi ngày trong khoảng Từ ngày/Đến ngày, theo schema hiện tại; dùng DayEditor để sửa tên/loại từng ngày. History/Today/Reports tự đọc cùng days/targetSeconds, không thêm phép tính riêng ở giao diện. Không tự tải danh sách lễ quốc gia hoặc lặp hằng năm; khoảng nghỉ vẫn do người dùng chọn.
