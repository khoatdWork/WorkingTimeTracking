# CONTEXT — App shell

P0/P1 implemented 09/11/2026. tracker-app.tsx ghép modules, navigation Hôm nay/Lịch sử/Báo cáo và Settings header, clock tick client-only sau hydrate, backup/import/reset dialogs. Route src/app/page.tsx chỉ composition; layout metadata/font/globals. Static export, basePath từ env cho GitHub Pages.

Khung max480px, mobile320–430, palette và font QuanLyTaiSan. Bottom nav safe-area, nội dung có khoảng tránh che focus, skip link. Tabs hiện là view trong một route, filter ở local state; URL chưa lưu tab/filter. Không có dữ liệu mẫu production.

Shadcn installed qua CLI; style giữ Design.md. Lint/typecheck/build và Playwright PASS, xem P1/P2. Auth/data errors khác empty; khi cloud load lỗi vẫn có sign-out. Import/reset có AlertDialog, file<=900KB và validateState, không tự trộn local/cloud. Source env và test artifacts ignored.
