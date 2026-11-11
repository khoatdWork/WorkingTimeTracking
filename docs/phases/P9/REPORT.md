# P9 — Trạng thái lưu trữ trong Cài đặt

Ngày 11/11/2026. Người dùng yêu cầu bỏ thông báo local/Firebase khỏi màn chính và chuyển vào Cài đặt.

Đã chuyển nhãn Trên thiết bị / Local + Firebase, thông báo mất mạng và trạng thái đồng bộ/lỗi/nút thử lại vào Cài đặt → Tài khoản & đồng bộ. AccountPanel nhận slot status tùy chọn; màn lỗi mở sổ vẫn dùng được AccountPanel mà không cần trạng thái đồng bộ. Banner cập nhật PWA có hành động vẫn ở app-shell. Lỗi đọc/lưu và toast hiện có giữ nguyên.

Không đổi core, dữ liệu, schema, quy tắc Firestore, Auth hoặc thuật toán đồng bộ. Chỉ hiện đồng bộ thành công theo trạng thái đã được hook xác nhận như trước. CSS tăng cỡ nhãn và cho thông báo trong panel xuống dòng.

Source review, lint/typecheck/build,44 unit tests,2 Rules emulator và full npm run test:e2e Chromium/WebKit PASS local và CI. Account offline320 axe/overflow được kiểm riêng và ảnh sync-error/offline đã xem.

Release b1e641ec6dd656a10cb9262c9423df291a70cd52 đã deploy lên [Pages](https://khoatdwork.github.io/WorkingTimeTracking/)11/11/2026 lúc10:03:43ICT. [Actions42949633931](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42949633931) verify-build4m39s/deploy9s SUCCESS. Hosted app/settings Chromium+WebKit, Chromium offline HTTPS PWA và WebKit manifest/worker smoke PASS. Cache du-gio-pwa-%2FWorkingTimeTracking%2F-13ad89bf21be6143 khớp CI. Firebase tài khoản thật và thiết bị vật lý NOT RUN. Xem test-results.md để biết bằng chứng và giới hạn.

Nếu PWA còn bản cũ, mở Cài đặt → Cài ứng dụng → Cập nhật ứng dụng, hoặc đóng hết cửa sổ app rồi mở lại.
