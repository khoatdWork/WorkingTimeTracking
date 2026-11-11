# CONTEXT — Chấm công, lịch sử và báo cáo

Release11/11/2026: P7/P8 ecf7375 đã deploy, Actions42946545547 SUCCESS. Hosted leave/holiday/app/WFH Chromium+WebKit PASS trong guest context cô lập, không ghi Firebase thật. Kiểm ngày mai/range/conflict/tháng/nháp/JSON/sửa-xóa/chỉ tiêu và giao diện320390; chi tiết docs/phases/P7,P8. Firebase tài khoản thật và thiết bị vật lý NOT RUN; các ghi chép chưa deploy ngày10/11 phía dưới là lịch sử.

P8,10/11/2026: TimeOffPlanner nhận onDirtyChange tùy chọn khi ghép tại mục Ngày nghỉ lễ trong Cài đặt. So ngày/ghi chú với baseline lần lưu gần nhất để shell nhắc trước khi rời màn; save thành công mới rebase, lỗi giữ nháp. Có beforeunload khi tích hợp guard. Planner nghỉ phép tại Today không đổi cách ghép P7.

Implemented P1, 09/11/2026. overview.tsx chấm công hôm nay, WFH/request, vòng giờ, tuần/tháng và ca. history.tsx lọc tháng/WFH/thiếu; reports.tsx tổng tháng + tuần giới hạn trong tháng + bar chart; month-picker.tsx dùng Input type month; day-editor.tsx thêm/sửa/xóa ca, location, request, nghỉ/lễ và note.

UI lấy mọi phép tính từ core. Lưu qua hook save callback. Editor giữ baseline version để không ghi đè draft stale, beforeunload + AlertDialog khi rời, delete xác nhận. Validation input giữ lại khi lỗi. Có thể lập kế hoạch WFH/nghỉ tương lai, không tạo ca làm tương lai.

shadcn CLI: Button/Input/Label/Textarea/Badge/AlertDialog/Sonner. Chart là SVG circle/CSS bars vì là tiến độ đơn giản có số giờ kèm và accessible label; không cần thêm chart dependency. Segmented buttons native aria-pressed tạo composition từ shadcn, không tự viết primitive.

Playwright Chromium/WebKit đã kiểm 320/360/390/430/1280px và axe WCAG A/AA trên 3 màn chính. Screenshots output/playwright/P1 (ignored). Dữ liệu test giả, không ghi Firebase. Skill frontend-design/web-design-guidelines + Python webapp-testing; CLI reconnaissance không chạy được do máy thiếu Chrome channel, đã dùng bundled Playwright browsers với Python. Chi tiết test-results và review trong docs/phases/P1.

P4: WFH mới không có nút vào/về. Today chọn 8/10 giờ lưu ngay qua run; hiển thị số giờ cố định và request như trước. Editor WFH chỉ chọn giờ + request/note, không có datetime inputs. Ngày tương lai chỉ kế hoạch/request. Legacy sessions không tự đổi: request/note giữ nguyên ca, chọn giờ rồi Lưu mở AlertDialog trước khi thay; đổi fixed WFH sang office/nghỉ cũng xác nhận. Xem P4 tests/reviews. Tổng History/Reports lấy workedSeconds nên không có phép cộng WFH riêng ở UI.

P6: mục Ngày nghỉ lễ trong tab Cài đặt tạo một WorkDay kind=holiday cho mỗi ngày trong khoảng Từ ngày/Đến ngày, theo schema hiện tại; dùng DayEditor để sửa tên/loại từng ngày. History/Today/Reports tự đọc cùng days/targetSeconds, không thêm phép tính riêng ở giao diện. Không tự tải danh sách lễ quốc gia hoặc lặp hằng năm; khoảng nghỉ vẫn do người dùng chọn.

P7, 10/11/2026: time-off-planner.tsx tái sử dụng toàn bộ form/danh sách của HolidaySettings cho kind=leave/holiday. Today hiển thị Nghỉ phép ngay sau chấm công: nút Thêm ngày nghỉ phép mở khoảng ngày mặc định ngày mai VN (tính lại lúc mở), ghi chú tùy chọn; lưu xong thu form, giữ tháng bắt đầu. Hủy form bỏ nháp; lỗi lưu giữ nguyên input. Sửa qua DayEditor; xóa có AlertDialog, baseline version và kiểm loại ngày. Today nhận tháng ở app-shell để quay lại từ editor không mất tháng đang xem. Ngày nghỉ hiện tại hiện trạng thái/note thay đồng hồ/nút vào ca/WFH; nếu ca trước vẫn chạy vẫn cho kết thúc. Lịch tuần có P và chú giải, accessible label ghi Nghỉ phép; History hiện note/nghỉ không yêu cầu giờ. DayEditor xác nhận trước khi loại bỏ ca văn phòng để chuyển thành nghỉ/lễ. Không đổi schema hay công thức giờ. Báo cáo/kiểm thử P7 ở docs/phases/P7; chưa deploy, Firebase thật NOT RUN.
