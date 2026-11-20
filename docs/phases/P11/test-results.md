# P11 — Kiểm chứng điều tra ngày 20/11/2026

Không sửa production source hoặc deploy; các kiểm tra dưới đây đánh giá bản mã hiện tại. Các ca tái hiện xác nhận hành vi nguy hiểm hiện có, không phải đã sửa lỗi.

## Cập nhật sau đăng nhập Console ngày20/11

| Kiểm tra mới | Kết quả | Giới hạn |
| --- | --- | --- |
| JSON người dùng | PASS | Core validateState; các bản ghi còn lại, giữ bản gốc và checksum ngoài Git |
| Console thật | PASS, read-only | Đăng nhập thành công; document còn dữ liệu trước sự cố; uid đối chiếu Authentication; không ghi dữ liệu |
| Tạo candidate | PASS | Hợp toàn bộ ngày cloud và guest;0conflict; assert giữ nguyên từng bản ghi/settings/timestamps |
| `node output/verification/P11/verify-recovery.mjs` | PASS Chromium+WebKit | Nhập candidate qua UI/AlertDialog, so toàn bộdays/settings, tổng giây và reload; context cô lập, không ghi cloud |
| Bản sao candidate trong Downloads | PASS | SHA256 khớp candidate riêng |
| iPhone import/hosted sync | NOT RUN | Chưa áp dụng candidate trên thiết bị thật hoặc ghi server |
| Backup/PITR | NOT RUN | Không cần phục hồi lịch sử khi sổ cloud hiện còn; chưa kiểm cấu hình |

Harness nhập candidate ban đầu đọc local quá sớm ở WebKit; thêm đợi đủ dữ liệu được persist rồi chạy lại cả hai engines PASS. Không sửa production. Dữ liệu thật và ảnh kiểm thử candidate ở `.private/recovery/P11/` (ignored). Bảng dưới là bằng chứng giai đoạn trước khi người dùng đăng nhập Console; dòng hosted document NOT RUN ở bảng cũ đã được cập nhật bởi Console read-only PASS ở trên, không phải hosted sync PASS.

| Kiểm tra | Kết quả | Phạm vi |
| --- | --- | --- |
| `npm run lint` | PASS | ESLint |
| `npm run typecheck` | PASS | Next typegen + strict TS |
| `npm run build` | PASS | Static export + PWA, cache local `du-gio-pwa-%2F-358896593ce9068f` |
| `npm run test:unit` | PASS, 44 tests | Suite hiện có |
| `npx vitest run output/verification/P11/sync-loss.test.ts` | PASS, 4 tests | Characterization: dirty overwrite, missing remote, edit before first pull, guest/uid separation |
| `npm run test:db` | PASS, 2 tests | Firestore emulator `demo-working-time`, bundled Java 21; không đọc/ghi production |
| `npm run test:sync` | PASS | Playwright Chromium + WebKit, suite sync/account/offline/settings hiện có |
| `node output/verification/P11/browser-loss.mjs` | REPRODUCED, cả 2 engines | Hai đường ghi đè; guest rỗng nhưng uid vẫn có tháng 11; đăng nhập fixture mở lại bản uid |
| Kiểm tra ảnh | PASS | Đã xem WebKit guest/misleading status và account history phục hồi từ fixture |
| Full production UI/PWA E2E | NOT RUN trong P11 | Không thay UI/source; đã chạy targeted sync/UI fixture, không dùng bằng chứng P10 để tuyên bố chạy mới |
| Hosted Firebase document/backup/PITR | NOT RUN | CLI không có phiên xác thực hợp lệ |
| Khôi phục trên iPhone thật | NOT RUN | Chỉ quan sát ảnh người dùng gửi; không điều khiển/đọc localStorage điện thoại |
| Hosted Firebase sync verified | NOT RUN | Không đăng nhập/ghi dữ liệu thật trong phase này |

Artifacts giả và harness: `output/verification/P11/` (ignored). Unit chẩn đoán cố ý mô tả chính sách hiện tại; sau khi sửa cần đảo kỳ vọng để kiểm dữ liệu được giữ, không đưa chúng vào suite như yêu cầu duy trì lỗi.

Lần chạy browser chẩn đoán đầu dừng ở WebKit vì assert đọc local trước khi sync hoàn tất. Harness đã đợi cloudVersion/dirty xác nhận đúng vòng sync và chạy lại thành công trên cả hai engines; không sửa production để làm test qua.
