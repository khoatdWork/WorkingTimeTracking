# P9 — UI source review

Ngày 11/11/2026. Đọc diff và kiểm cấu trúc UI theo mẫu hiện có của dự án; không fetch guideline mới, không kiểm ảnh hoặc thao tác browser trong lượt review này.

Không có blocker trong source. Các trạng thái động giữ role=status. Nút Thử đồng bộ lại tiếp tục dùng Button, callback và disabled khi busy. Thông báo mất mạng dùng div để tránh kiểu chữ của account-panel > p. Nội dung lỗi dài có overflow-wrap. Panel tài khoản khi lỗi mở sổ vẫn hoạt động mà không bắt buộc slot trạng thái.

Chỉ các thông báo lưu trữ/sync được chuyển; lỗi đọc/lưu và banner cập nhật PWA vẫn ở luồng cần hành động. Follow-up: sync fixture Chromium/WebKit PASS vị trí notice/retry và giữ nháp khi tự sync; ảnh Chromium320 sync-error/offline được root và browser agent xem không thấy clipping hoặc overflow. Production Settings axe320390 và riêng guest account offline axe/overflow320 PASS cả hai engines. Hosted còn chờ tại test-results.md.
