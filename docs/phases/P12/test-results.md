# P12 — Kết quả kiểm thử

20/11/2026. Source local, demo emulator, CI và hosted Pages; browser contexts cô lập. App `4e94360` đã deploy17:55:13ICT, Rules P12 publish21:27ICT. Chưa kiểm iPhone thật hoặc authenticated Firebase transaction production qua P12.

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
| CI release | PASS | [Actions44717065768](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/44717065768), SHA4e943601d7b56fcac616fea9d16e0ae7dbb3393c; lint/typecheck/build/65unit/4Rules/full E2E, verify-build+deploy success |
| Hosted Pages regression | PASS | `APP_URL=https://khoatdwork.github.io/WorkingTimeTracking/ NEXT_PUBLIC_BASE_PATH=/WorkingTimeTracking node scripts/e2e.mjs`, exit0; app/Today/WFH/holidays/leave/settings Chromium+WebKit, guest contexts, không ghi dữ liệu cloud |
| Hosted PWA | PASS trong phạm vi | Chromium HTTPS manifest/icons/installability/scope/offline save/reload/new window/reconnect/cache privacy+axe; WebKit manifest/icons/worker/ready smoke. Hosted WebKit offline navigation NOT RUN; local refusal-based suite PASS |
| Hosted worker = CI artifact | PASS | Cache `du-gio-pwa-%2FWorkingTimeTracking%2F-caab7680aded1cb0`, so từng byte artifact.tar/sw.js với hosted sw.js; SHA2568fd98f43138d84a99db86d1c76a0f11e4531d5130a2523404f40081008db301c |
| Hosted Firebase P12 sync | NOT RUN | Chưa đăng nhập/ghi production qua bản P12 |
| Physical iPhone/long-session | NOT RUN | Cần kiểm sau cập nhật; fixture WebKit không thay nghiệm thu thiết bị thật |
| Production Rules P12 | PUBLISHED / CONSOLE VERIFIED | Project workingtimetracking-f974c,20/11/2026 lúc21:27ICT; editor khớp canonical trước Publish, sau publish hết trạng thái unpublished và phiên bản mới đánh dấu sao Today9:27PM; history/getAfter có trong nội dung sau publish. Không coi đây là kiểm live transaction |

Evidence release tại `output/release/P12/` (ignored): `actions-result.json`, `worker-verification.json`, `hosted-checks.txt`, `firestore-published.jpg`. Hosted browser screenshots từ runner ở `output/playwright/P1`, P3, P4, P6, P7, P8, P10; bản chụp chọn lọc đã giữ riêng trong `output/release/P12/`. Báo cáo không nhúng sổ thật, UID, email hoặc credentials. Hướng dẫn cập nhật iPhone và giới hạn vận hành ở REPORT.md.

Các ca hồi quy mới giữ nguyên timestamp/giây; không có dữ liệu thật trong fixtures. Artifacts giả ở output/playwright/P12 (ignored). Chạy lại build/lint/unit sau các sửa cuối về baseline legacy và thông báo quota; production UI/PWA không đổi giữa hai lần kiểm đó. Không lấy kết quả P11 làm P12 hosted verification.

Các failure trong quá trình làm đã xử lý: test cũ kỳ vọng guest bị xóa và local thắng phải đổi theo yêu cầu an toàn; save y hệt server không còn gọi write; fixture settings cần thật sự không xung đột; hộp nhập Radix Action tự đóng khi lỗi đổi thành Button chờ kết quả; axe đọc toast giữa transition ở WebKit phải đợi toast rời trước audit trang. Lỗi type adapter Firestore compat trong test emulator đã sửa tại boundary mock, SDK transport thật vẫn được chạy.

Node26 Web Locks trong môi trường unit gây timeout khi callback quota ném lỗi; unit stub navigator không có locks để kiểm logic xác định. Bổ sung Playwright với Web Locks thật: chặn history setItem bằng QuotaExceededError →0upload, khôi phục storage và retry→sync thành công trên Chromium/WebKit. Không bỏ qua kiểm lock/không sửa production để né lỗi runtime unit.
