# Chỉ dẫn dự án

Đọc AGENT.md, Design.md, PLAN.md và CONTEXT.md của module liên quan trước khi sửa.
Dùng Next.js App Router, TypeScript strict, shadcn/ui. Routes chỉ ghép màn hình; nghiệp vụ giờ ở tracking/core, dữ liệu ở tracking/data, Firebase client ở lib/firebase.
Không làm tròn tăng giờ đã làm. Không đánh dấu đồng bộ trước khi Firebase xác nhận. Không đưa secrets vào repository.
Verify lint/typecheck/build, unit cho nghiệp vụ và browser bằng Playwright. Test Firestore rules bằng emulator; ghi NOT RUN nếu chưa chạy được. Cập nhật CONTEXT và báo cáo phase, không tuyên bố hosted Firebase verified khi chưa có project thật.
