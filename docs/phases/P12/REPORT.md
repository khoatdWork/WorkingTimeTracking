# P12 — Bảo vệ sổ và phục hồi sau sự cố mất phiên

20/11/2026, Asia/Ho_Chi_Minh. Người dùng xác nhận dữ liệu đã đúng sau khi nhập JSON ở P11 và yêu cầu sửa nguyên nhân để tránh tái diễn. **Đã kiểm thử local/emulator; người dùng đã phê duyệt triển khai ngay app+Rules.** Kết quả deploy/hosted được ghi sau khi xác nhận thực tế; không lấy nghiệm thu fixture làm hosted Firebase sync.

## Vấn đề và hành vi mới

App cũ mở sổ guest khi Firebase Auth trả null/lỗi, trong khi sổ uid vẫn tồn tại. Người dùng dễ hiểu nhầm toàn bộ dữ liệu đã mất, nhất là câu offline có chữ “đã đăng nhập Google”. Local dirty được tải đè toàn document bằng version cloud vừa đọc; không có baseline nội dung hoặc lịch sử bất biến. Việc nhập JSON đã cứu dữ liệu nhưng không sửa các đường ghi này.

P12 giữ sổ uid khi mất phiên, hiện cảnh báo đăng nhập lại, tiếp tục lưu offline vào đúng uid và không upload đến khi Auth xác nhận đúng uid. Marker local nhớ chủ sổ; khi nâng cấp có thể tìm một key uid cũ, nhiều uid thì yêu cầu đăng nhập thay vì đoán. Marker mất cùng mọi dữ liệu trình duyệt không thể được suy ra lại; banner guest luôn nói rõ chưa đăng nhập. Chỉ Đăng xuất chủ động chuyển sang guest. Auth dùng persistent IndexedDB/localStorage, không chọn session-only; lỗi callback hoặc khởi tạo đồng bộ đều không tạo sổ thay thế.

Envelope local thêm `base` là nội dung server đã xác nhận, giữ tương thích envelope P5 thiếu base. `merge.ts` ghép theo ngày/settings với ba bản base/local/remote. Khi không có baseline, chỉ hợp ngày không trùng hoặc giống hệt; cloudVersion đơn thuần không đủ chứng minh được phép xóa ngày. Xóa có baseline vẫn có hiệu lực nếu phía kia không sửa cùng ngày. Xung đột cùng ngày/settings hoặc ghép gây ca trùng/không hợp lệ thì giữ cả hai và dừng upload. Cloud missing, version lùi hoặc nội dung đổi cùng version đều bị chặn. Edit trong pull/upload được rebase lên nội dung đã nhận; không biến ngày remote mới thành xóa ngoài ý muốn. Response cũ không clear dirty của edit mới hoặc owner khác.

Mỗi lần cập nhật state cloud, `writeCloud` transaction đọc state/history và lưu nguyên bản server trước đó tại `users/{uid}/trackerHistory/{version}` cùng giao dịch thay state. Rules yêu cầu nội dung history khớp state trước; history chỉ owner read/create, cấm sửa/xóa. Client PWA cũ chỉ `set(state)` không còn được phép thay state mà bỏ qua bảo toàn bản trước. History có sẵn được kiểm tra và không ghi lại. Hai transaction cùng expectedVersion chỉ một cái thành công.

Local giữ tối đa10bản trước đó/tổng khoảng1MB; còn ít hơn khi sổ lớn. Checkpoint phải lưu được trước khi thay local hoặc upload bản khác cloud. Quota/corrupt/revision lỗi chặn thay sổ, giữ raw data. Guest gốc không xóa sau claim; marker đảm bảo chỉ tài khoản đầu tiên nhận. Mục Bản sao lưu cho tải bản local và10bản cloud gần nhất, không tự nhập. Xung đột có xuất hai bản, chọn cả sổ với AlertDialog; lựa chọn hết hiệu lực khi owner/version/remote đổi, đọc lại cloud trước khi áp dụng. Import/xóa xác nhận owner/version lúc mở và giữ dialog/input khi thao tác thất bại.

## Phạm vi

Không đổi TrackerState/schema giờ, timestamp, phép tính giây, WFH hoặc routes. Thêm `merge.ts`, `backup-history.tsx`; sửa repository/sync/cloud/hook, AccountPanel, shell, Firebase Auth initialization và rules. Callers/tests/fixtures/runner/docs cập nhật. Không thêm dependency, service credentials hoặc dữ liệu thật vào repository. P11 JSON/cloud backup thật vẫn chỉ ở `.private/recovery/P11/` (ignored).

UI giữ palette/Be Vietnam Pro/shadcn và bốn tab. Cảnh báo guest/mất phiên/lỗi/first pull/xung đột là ngoại lệ có chủ đích với P9 chỉ đặt trạng thái trong Cài đặt: sau sự cố nhầm sổ, cảnh báo có hành động phải được thấy ngoài màn tài khoản. Trạng thái đồng bộ bình thường vẫn ở Tài khoản.

## Kiểm chứng

Chi tiết `test-results.md`. Unit bao phủ merge/delete/race/missing/regression/quota/legacy baseline/owner/history. Rules emulator còn chạy transport Firebase SDK thật qua `writeCloud`, `readCloud`, `readCloudHistory`, xác nhận snapshot lịch sử, stale write và giao dịch đồng thời. Playwright Chromium/WebKit kiểm app/PWA hiện có và thêm mất Auth, lỗi Auth init/callback, offline reopen/edit scoping, intentional logout, legacy owner, conflict giữ qua reload, export, cancel/resolve, history UI, import đổi tài khoản và axe320.

Không sửa giờ giả trong Firebase production. Chưa kiểm P12 Google sign-in/long-session trên iPhone thật hoặc server write production. Việc P11 đọc Console thật không chứng minh luồng P12 này PASS. Công cụ subagent không tạo được reviewer do model kế thừa `my-common` không khả dụng; review/audit tại phase là tự rà, không gán thành reviewer độc lập.

## Triển khai và giới hạn

Publish rules P12 và release Pages là thay đổi production, cần phối hợp cập nhật PWA. Đã mở Console read-only xác nhận rules09/11 còn đang áp dụng và không có history; chưa sửa editor/publish. Rules mới chặn cách ghi P5/P10; app cũ vẫn giữ local pending, phải cập nhật để đồng bộ. Không rollback về rules cũ chỉ để bỏ qua lỗi, vì sẽ mở lại đường ghi không lưu lịch sử. Mở app mới trước khi rules publish có thể báo chưa sync được vì path history chưa được cấp quyền; local giữ nguyên.

History bắt đầu ở lần ghi đầu qua P12, không hồi tạo những phiên bản đã mất trước đó. Mỗi lần cập nhật thêm một snapshot server và đọc transaction; theo dõi quota/dung lượng Spark, tách sổ/history theo tháng trước khi gần đầy. Quota đầy làm sync lỗi và giữ pending, không giả báo thành công. Snapshot local vẫn cùng vùng lưu trữ trình duyệt; nếu iOS/người dùng xóa dữ liệu trước khi giờ offline lên cloud, không có phần mềm web nào phục hồi được bản chưa từng tải lên. Admin Firebase có thể thay/xóa dữ liệu qua công cụ quản trị ngoài Rules; P12 không ngăn quyền quản trị. Không bật billing, PITR hoặc dịch vụ trả phí trong phase này.
