# P9 — Trạng thái lưu trữ trong Cài đặt

Ngày 11/11/2026. Người dùng yêu cầu bỏ thông báo local/Firebase khỏi màn chính và chuyển vào Cài đặt.

Đã chuyển nhãn Trên thiết bị / Local + Firebase, thông báo mất mạng và trạng thái đồng bộ/lỗi/nút thử lại vào Cài đặt → Tài khoản & đồng bộ. AccountPanel nhận slot status tùy chọn; màn lỗi mở sổ vẫn dùng được AccountPanel mà không cần trạng thái đồng bộ. Banner cập nhật PWA có hành động vẫn ở app-shell. Lỗi đọc/lưu và toast hiện có giữ nguyên.

Không đổi core, dữ liệu, schema, quy tắc Firestore, Auth hoặc thuật toán đồng bộ. Chỉ hiện đồng bộ thành công theo trạng thái đã được hook xác nhận như trước. CSS tăng cỡ nhãn và cho thông báo trong panel xuống dòng.

Source review, lint/typecheck/build,44 unit tests,2 Rules emulator và full npm run test:e2e Chromium/WebKit PASS. Account offline320 axe/overflow được kiểm riêng và ảnh sync-error/offline đã xem. Chưa deploy P9, hosted Firebase thật và thiết bị vật lý NOT RUN. Xem test-results.md để biết bằng chứng cập nhật.
