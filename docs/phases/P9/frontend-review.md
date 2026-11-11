# P9 — Frontend source review

Ngày 11/11/2026. Source review PASS; chưa kiểm hình ảnh hoặc browser độc lập trong lượt review này.

Thay đổi dùng lại AccountPanel, Button và kiểu connection-notice/storage-label sẵn có. Header bớt nhãn lưu trữ; thông tin liên quan tài khoản và sync nằm cùng panel trong Cài đặt. Banner cập nhật PWA vẫn dẫn tới hành động cập nhật. Không thêm màn hình, route, primitive hoặc thư viện.

CSS nhãn lưu trữ tăng lên 12px; thông báo trong account có margin riêng và overflow-wrap để lỗi dài có thể xuống dòng. Các thay đổi này phù hợp palette/bố cục mobile hiện tại của Design.md. Đánh giá dựa trên source và mẫu đã có, không dựa trên hướng dẫn web vừa tải hoặc ảnh render mới.

Follow-up: root và browser agent đã xem ảnh Chromium320 lỗi sync và offline tại output/playwright/P9/. Header gọn, nhãn12px, lỗi/nút thử lại và offline notice nằm trong panel, không overflow. Sync fixture và production Settings Chromium/WebKit PASS; axe/overflow320390 của Settings và riêng account offline320 cả hai engines PASS. Hosted còn chờ ở test-results.md.
