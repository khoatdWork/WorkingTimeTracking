# P8 — Cài đặt dạng danh sách

Yêu cầu10/11/2026: Cài đặt quá dài; muốn hiển thị như Settings của iPhone và chỉ chỉnh từng phần sau khi bấm. Màn đầu nay có năm hàng trong ba nhóm: Tài khoản & đồng bộ; Quy tắc giờ làm/Ngày nghỉ lễ; Cài ứng dụng/Bản sao lưu. Hàng có icon màu, tên, tóm tắt trạng thái và chevron. Chạm một hàng mới mở panel tương ứng, có Quay lại Cài đặt. Bốn tab dưới giữ nguyên; màn đầu không chứa form hay thao tác xóa dữ liệu.

settings-menu.tsx chỉ ghép danh sách; app-shell quản lý settingsSection theo mẫu local-screen hiện có. Tái sử dụng SettingsForm, TimeOffPlanner, AccountPanel, PwaPanel và bản sao lưu/import/reset. Không thêm route, dependency, schema, Firestore rules hoặc công thức giờ. Quay lại từ DayEditor vẫn mở mục Ngày nghỉ lễ và tháng đang xem. Focus chuyển tới h1 khi đổi mục; tiêu đề panel lặp được ẩn trong màn chi tiết vì đã có h1.

Thêm guard cho nháp giờ/ngày lễ khi quay lại, đổi tab, mở cập nhật hoặc sửa ngày đã lưu. Tiếp tục chỉnh sửa giữ nguyên form; chỉ bỏ nháp khi người dùng xác nhận. Cả hai form nhắc trước browser unload, giữ input nếu save lỗi. SettingsForm nhận thay đổi mới khi chưa sửa; khi đã sửa giữ baseline riêng, từ chối ghi nếu settings ở tab khác thay đổi, không remount vì version của ngày khác. Input/WFH và điều hướng disable trong lúc persist để tránh bỏ sửa sau submit. Thành công vẫn đợi local persistence, trạng thái Firebase vẫn đợi server xác nhận.

Notice phiên bản mới hiện cả tại danh sách Cài đặt và các mục khác, mở thẳng Cài ứng dụng qua guard. Install/update/offline/Auth/backup vẫn dùng đường hiện tại và xác nhận cũ. Không thêm quy trình đăng nhập hay thay đổi sổ thật.

Giữ Be Vietnam Pro, palette, max480px và native inputs. Các nhóm dùng viền và hàng cao tối thiểu76px, nội dung căn trái, mũi tên phải; không có shadow từng hàng. Root đã xem screenshot320/390 và các màn chi tiết. Kết quả kiểm tra ở test-results.md, review/audit/UI trong cùng thư mục. P8 chưa deploy; hosted Firebase thật và thiết bị vật lý NOT RUN.
