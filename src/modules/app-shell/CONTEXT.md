# CONTEXT — App shell

P0/P1 implemented 09/11/2026. tracker-app.tsx ghép modules, navigation Hôm nay/Lịch sử/Báo cáo và Settings header, clock tick client-only sau hydrate, backup/import/reset dialogs. Route src/app/page.tsx chỉ composition; layout metadata/font/globals. Static export, basePath từ env cho GitHub Pages.

Khung max480px, mobile320–430, palette và font QuanLyTaiSan. Bottom nav safe-area, nội dung có khoảng tránh che focus, skip link. Tabs hiện là view trong một route, filter ở local state; URL chưa lưu tab/filter. Không có dữ liệu mẫu production.

Shadcn installed qua CLI; style giữ Design.md. Lint/typecheck/build và Playwright PASS, xem P1/P2. Auth/data errors khác empty. Import/reset có AlertDialog, file<=900KB và validateState. Source env và test artifacts ignored.

P3: usePwa đăng ký worker production ngay ở shell; PwaPanel trong Settings có cài app/hướng dẫn/cập nhật qua AlertDialog. Banner phiên bản mới đưa tới Settings, không hiện trong editor để tránh mất nháp. Brand href luôn có trailing slash để offline navigation nằm trong worker scope. Layout có manifest, Apple metadata/icon, viewport-fit và header top safe area.

P5: luôn hiển thị sổ local, kể cả đăng nhập/offline. Header Local + Firebase; status phân biệt đang sync/chờ sync/đã sync và lỗi Firebase với nút thử lại. Sync lỗi không chặn nội dung hoặc chỉnh sửa local. Toast lưu chỉ nói đã lưu thao tác, status mới xác nhận Firebase. Help backup/import/reset/account/PWA được cập nhật theo local-first. JSON/CSV luôn xuất trạng thái local hiện tại. Import/xóa lưu local trước rồi tự sync. Chi tiết tests/review docs/phases/P5; chưa deploy P5.
