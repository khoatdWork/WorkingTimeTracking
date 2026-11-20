# P12 — Kết quả kiểm thử

20/11/2026. Source local, demo emulator, browser contexts cô lập. Chưa deploy Pages/Rules hoặc kiểm iPhone thật.

| Kiểm tra | Kết quả | Bằng chứng/phạm vi |
| --- | --- | --- |
| Lint | PASS | ESLint, không warning sau sửa |
| Typecheck | PASS | Next typegen + TypeScript strict |
| Unit | PASS |65tests/7files: domain, storage, cloud, sync, merge, leave/holiday |
| Firestore Rules + SDK transaction | PASS |4tests, Java21 emulator `demo-working-time`: owner/version/schema; thiếu/giả history bị từ chối; history immutable/private; SDK state/history commit; stale/concurrent write |
| Production build | PASS | Next static export/PWA, cache local `du-gio-pwa-%2F-2b830fae53632a62` |
| Full Playwright | PASS | Chromium+WebKit app/Today/WFH/holidays/leave/settings/PWA/sync/data-safety |
| PWA | PASS | Offline save/reopen/new window, update/dirty guard/cancel/rollback, cache scope/privacy |
| P12 Auth/data safety | PASS | Callback/init failure, retained uid, legacy marker migration, offline scoped edits, re-login, explicit logout, conflict no upload/reload/export/cancel/resolve, recovery list, import account switch |
| UI axe/overflow | PASS | Các màn hiện có320390 và P12 conflict/recovery320; xem ảnh output/playwright/P12 |
| Hosted Pages/Rules | NOT RUN | Chưa publish |
| Hosted Firebase P12 sync | NOT RUN | Chưa đăng nhập/ghi production qua bản P12 |
| Physical iPhone/long-session | NOT RUN | Cần kiểm sau cập nhật; fixture WebKit không thay nghiệm thu thiết bị thật |
| Production Rules hiện tại | READ-ONLY VERIFIED | Console ngày20/11 còn rules09/11 không có history; chưa chỉnh/publish |

Các ca hồi quy mới giữ nguyên timestamp/giây; không có dữ liệu thật trong fixtures. Artifacts giả ở output/playwright/P12 (ignored). Chạy lại build/lint/unit sau các sửa cuối về baseline legacy và thông báo quota; production UI/PWA không đổi giữa hai lần kiểm đó. Không lấy kết quả P11 làm P12 hosted verification.

Các failure trong quá trình làm đã xử lý: test cũ kỳ vọng guest bị xóa và local thắng phải đổi theo yêu cầu an toàn; save y hệt server không còn gọi write; fixture settings cần thật sự không xung đột; hộp nhập Radix Action tự đóng khi lỗi đổi thành Button chờ kết quả; axe đọc toast giữa transition ở WebKit phải đợi toast rời trước audit trang. Lỗi type adapter Firestore compat trong test emulator đã sửa tại boundary mock, SDK transport thật vẫn được chạy.

Node26 Web Locks trong môi trường unit gây timeout khi callback quota ném lỗi; unit stub navigator không có locks để kiểm logic xác định. Bổ sung Playwright với Web Locks thật: chặn history setItem bằng QuotaExceededError →0upload, khôi phục storage và retry→sync thành công trên Chromium/WebKit. Không bỏ qua kiểm lock/không sửa production để né lỗi runtime unit.
