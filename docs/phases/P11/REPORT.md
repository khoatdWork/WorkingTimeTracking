# P11 — Điều tra dữ liệu tháng 11 không xuất hiện

Follow-up: người dùng đã xác nhận sổ đúng sau khi nhập candidate JSON. P12 tiếp tục sửa luồng Auth/sync và bổ sung lịch sử; xem docs/phases/P12. Xác nhận này là dữ liệu hiện trên iPhone đúng, chưa phải bằng chứng P12 hosted transaction đã chạy.

Ngày 20/11/2026, Asia/Ho_Chi_Minh. Phase hiện tại: **đã điều tra mã và tái hiện bằng fixture; chưa khôi phục dữ liệu thật, chưa sửa/deploy ứng dụng**.

## Cập nhật sau khi đọc JSON và Firebase Console thật

20/11/2026: người dùng cung cấp JSON xuất từ iPhone và đăng nhập Firebase Console trong trình duyệt tích hợp. Đã xác nhận Console đăng nhập thành công; đọc document state qua các trường DOM đang hiển thị và đối chiếu uid với hàng người dùng trong Authentication. **Sổ cloud vẫn chứa dữ liệu tháng 11, phiên bản đã xác nhận, gồm dữ liệu đã nhập và lịch nghỉ tương lai.** Sổ guest từ JSON có các ngày mới chưa có trong cloud. Đây là hai sổ khác nhau, không có bằng chứng cloud đã bị xóa hoặc bị guest ghi đè ở thời điểm kiểm tra.

Đã bảo toàn tệp guest gốc theo SHA256; chép lại toàn bộ4 trường gốc và các ngày/ca đang hiển thị trong Console vào JSON riêng, giữ timestamps/notes/request/settings. Nguồn này là bản chép các trường UI, không phải Firestore admin export và không có updateTime/lịch sử. Các tệp thật chỉ ở `.private/recovery/P11/` (ignored), không đưa tài khoản, uid hay dữ liệu ca làm vào Git.

Đã tạo candidate `du-gio-restored-2026-11-20.json` bằng phép hợp hai tập ngày:toàn bộ ngày cloud và guest, không trùng ngày hoặc xung đột cài đặt. Không sửa giờ, không làm tròn, không tạo ngày bị thiếu. Core validateState PASS; assert kiểm từng bản ghi đầu vào được giữ nguyên. Playwright Chromium/WebKit nhập candidate trong context guest cô lập, đối chiếu toàn bộ ngày/settings, tổng giây chính xác và reload PASS;0request tới fixture cloud,0ghi production. Candidate được sao chép thêm vào Downloads và đối chiếu SHA256.

Hướng phục hồi đã cụ thể: giữ cả hai bản gốc và candidate; đăng nhập lại đúng Google đã đối chiếu trên app iPhone, sau đó dùng Cài đặt → Bản sao lưu → Nhập JSON với candidate nếu cần hợp cả hai sổ. Import là bước người dùng thực hiện có xác nhận và sẽ tự sync theo cơ chế hiện tại. Sau import cần kiểm lịch sử tháng11 và server-confirmed status; **chưa thực hiện import iPhone hoặc ghi Firebase thật**, nên chưa tuyên bố phục hồi ứng dụng hay hosted sync PASS. Nếu có chỉnh sửa mới sau lúc chụp cloud/xuất guest, cần đối chiếu trước khi import candidate vì import thay toàn sổ.

Nguyên nhân trực tiếp của màn thiếu dữ liệu đã có bằng chứng: app iPhone đang ở guest trong khi sổ tài khoản ở cloud vẫn tồn tại. Chưa biết vì sao phiên Auth trên iPhone không khôi phục. Phần giới hạn về chưa đọc được cloud bên dưới ghi thời điểm điều tra ban đầu; nay Console read-only đã PASS, CLI vẫn chưa xác thực; backup/PITR và iPhone sync vẫn NOT RUN.

## Kết luận theo bằng chứng hiện có

Người dùng dùng PWA từ biểu tượng trên iPhone, cùng điện thoại/tài khoản dự kiến, đã thấy đúng sổ trước đó. Ảnh người dùng gửi ngày 20/11 hiển thị **Trên thiết bị**, lời mô tả lưu trên trình duyệt và nút **Đăng nhập với Google**. Như vậy phiên hiện tại của app đang ở chế độ khách, không có Firebase user; chưa chứng minh dữ liệu tháng 11 bị xóa.

`account-panel.tsx:44–49` hiển thị đúng các dấu hiệu này khi `user === null`. `use-tracker.ts:83–102` mở sổ khách khi Auth trả null hoặc lỗi. `repository.ts:8–9` tách key khách `du-gio.tracker.v1` với key tài khoản `du-gio.tracker.v1:{uid}`. Khi chuyển sang khách, app không xóa key tài khoản. Đây là giải thích phù hợp nhất với ảnh: sổ đang xem khác sổ tài khoản đã dùng trước đó. Chưa đọc được các key thật trên iPhone nên chưa xác nhận bản tài khoản còn nguyên.

Dòng vàng “Đang mất mạng. Dữ liệu vẫn lưu trên thiết bị và tự đồng bộ khi có mạng, đã đăng nhập Google.” là câu gây hiểu nhầm tại `tracker-app.tsx:237–239`: chỉ kiểm `!pwa.online`, không kiểm `user`, nên vẫn hiện phần “đã đăng nhập Google” khi đang là khách. Người dùng đã dựa vào câu này để nhận định vẫn đăng nhập. Nó không phải bằng chứng Auth thành công hoặc Firebase đã xác nhận đồng bộ.

Chưa xác định vì sao Auth không còn được khôi phục trên iPhone. Có thể là phiên/lưu trữ Auth thay đổi hoặc lỗi đọc Auth; chưa có log phân biệt. Không kết luận iOS tự xóa, token hết hạn, trình duyệt thu hồi lưu trữ hay người dùng đã đăng xuất. Riêng việc offline không có nhánh xóa sổ trong mã hiện tại.

## Rủi ro dữ liệu đã tái hiện, chưa gán là nguyên nhân sự cố thật

1. **Local đang chờ đồng bộ có thể thay toàn bộ cloud mới hơn.** `sync.ts:10–11` truyền `remote.version` vừa đọc, không so với `local.cloudVersion` của lần đồng bộ trước. `cloud.ts:38` dùng `transaction.set(ref, saved)` để thay toàn document. Transaction chỉ phát hiện thay đổi từ lần đọc ngay trước ghi, không phát hiện local đã lạc hậu từ trước. Fixture: local rỗng dirty, cloudVersion=1, cloud version=10 có ngày 18/11 → upload rỗng, cloud version=11, dirty=false. Đây là chính sách P5 đã được ghi rõ trong CONTEXT/README, nhưng không bảo toàn hai bản khi có xung đột.
2. **Cloud rỗng/mất document có thể thay bản local sạch đang có dữ liệu.** `cloud.ts:12` biến document không tồn tại thành `emptyState()` version=0. `sync.ts:20–28` nhận mọi version khác, kể cả thấp hơn hoặc bằng 0, rồi thay local mà không lưu bản trước. Fixture: local có ngày 18/11, cloudVersion=4 → remote v0 rỗng → local rỗng, dirty=false. Rules của app cấm delete document, nên tình huống này không phải hành vi xóa bình thường qua app; cần mất/thay document, thay đích hoặc tác động quản trị để phát sinh.
3. **Sửa trước khi tải cloud lần đầu xong có thể làm mất các ngày trên cloud.** `use-tracker.ts:74–75` bỏ loading trước khi sync xong. Edit trên placeholder rỗng được giữ để tránh đè input; vòng sync tiếp dùng chính sách local thắng toàn sổ. Unit fixture tái hiện ngày mới thay cả sổ ngày cũ. Không có bằng chứng người dùng đã gặp tình huống này.
4. **Dữ liệu có thể còn nhưng không được hiển thị ở sổ hiện tại.** Nếu uid đã có envelope thì `openLocal` trả ngay; bản guest khác không được tự nhận thêm. Không tự ghép hoặc tự chuyển dữ liệu giữa chủ sở hữu khi điều tra.

## Kết quả tái hiện

Playwright Chromium và WebKit dùng hook `useTracker`, repository, sync và UI thật, chỉ giả lập Auth/Firebase transport. Cả hai engines tái hiện màn khách rỗng giống ảnh người dùng trong khi key tài khoản vẫn chứa ngày 18/11. Sau sự kiện đăng nhập fixture vào cùng uid, ngày đó hiển thị lại từ local ngay cả khi offline. Đây là minh chứng cơ chế, **không phải đã đăng nhập/khôi phục trên iPhone thật**.

Hai hướng ghi đè ở mục 1–2 cũng đã tái hiện trên cả hai engines. Bốn unit chẩn đoán bao phủ các mục 1–4. Harness và ảnh/dữ liệu giả nằm ở `output/verification/P11/` (ignored); không đưa dữ liệu/tài khoản thật vào repository.

## Hướng xử lý theo thứ tự

1. **Giữ nguyên bản hiện tại.** Tạm offline, không nhập lại giờ, không nhập JSON, không xóa Safari/gỡ PWA/đăng xuất thêm. Vào Cài đặt → Bản sao lưu → Xuất JSON, lưu riêng trong Files. JSON hiện tại chỉ xuất sổ đang hiển thị; bản xuất khách rỗng không chứng minh bản tài khoản cũng rỗng.
2. **Kiểm tra trước khi đăng nhập lại.** Đọc JSON guest để xác định có dữ liệu/edits mới không. Nếu uid local cũ vẫn tồn tại, đăng nhập đúng Google cũ sẽ mở bản riêng của uid. Nếu uid chưa có và guest có thay đổi, đăng nhập có thể tự tải guest lên cloud theo P5; phải giữ/đối chiếu cả cloud và guest trước khi cho ghi. Không khuyên bấm đăng nhập rồi thử sync mù khi chưa biết bản nào còn dữ liệu.
3. **Đọc cloud bằng đường quản trị chỉ đọc, không mở app có auto-sync để dò.** Dùng đúng project `workingtimetracking-f974c`, lấy uid đúng người dùng từ Authentication, đọc `users/{uid}/tracker/state`, lưu riêng bản raw và kiểm ngày tháng 11, version, updateTime. Chỉ mở lại mạng/đồng bộ trên điện thoại sau khi bảo toàn các bản có thể cứu.
4. Nếu cloud/local tài khoản vẫn có tháng 11, phục hồi sổ đúng tài khoản rồi xuất JSON đầy đủ ngay. Nếu cần khôi phục từ JSON cũ, đối chiếu ngày mới và xung đột trước; import hiện tại thay toàn sổ, không merge. Không tự dựng giờ làm hoặc cộng làm tròn.
5. Nếu cả bản tài khoản và cloud đều mất, kiểm backup/PITR đã bật **trước sự cố** và tệp JSON trong Files/iCloud hoặc thiết bị khác. Chỉ khẳng định khôi phục khi thực sự đọc được bản cũ. Bật backup/PITR sau sự cố không tái tạo dữ liệu đã mất; repo không có lịch sử sổ để phục hồi. Không bật billing hoặc dịch vụ trả phí trong điều tra.

## Đề xuất sửa tối thiểu sau khi bảo toàn dữ liệu

- Sửa thông báo offline theo trạng thái Auth; phân biệt rõ “Chưa đăng nhập — đang xem sổ trên thiết bị” và sổ tài khoản. Khi Auth lỗi, hiển thị lỗi để tránh hiểu màn khách là sổ tài khoản đã trống.
- Trước upload, so cloud version với version đã xác nhận của bản local. Nếu cả hai phía thay đổi hoặc guest lần đầu gặp cloud đã có dữ liệu, giữ hai bản và yêu cầu đối chiếu; không tự thay toàn sổ. Kiểm tra version mới đọc ngay trong transaction vẫn giữ để chống thay đổi phát sinh tiếp.
- Không thay local có dữ liệu bằng cloud thiếu document hoặc version lùi mà không giữ bản cũ và thông báo. Lưu một bản phục hồi trước khi nhận cloud/thay sổ và bảo toàn remote trước upload có thể loại ngày.
- Không cho lần lưu trên placeholder chưa tải cloud tự trở thành sổ thay thế toàn bộ; giữ thay đổi mới riêng đến khi biết baseline hoặc xử lý xung đột.
- Nghiệm thu lại bằng tài khoản thật trên iPhone/PWA: đóng/mở sau thời gian dài, offline/reconnect, Auth không khôi phục, hai phiên, first pull, lỗi quyền, bản cloud trống và khôi phục. Fixture không thay thế nghiệm thu này.

## Giới hạn

Lệnh chỉ đọc `node node_modules/firebase-tools/lib/bin/firebase.js firestore:databases:get --project workingtimetracking-f974c --json --non-interactive` trả lỗi `Failed to authenticate, have you run firebase login?`. Chưa đọc được document thật, updateTime, backup/PITR hoặc cấu hình hiện hành của database. Không suy diễn từ cấu hình Spark ghi trong tài liệu cũ. Không lấy token từ trình duyệt/điện thoại, không ghi cloud thật, không deploy, không bật tính phí. Không có reviewer độc lập vì công cụ spawn từ chối model kế thừa `my-common`; đã tự đối chiếu caller, tests và ảnh chụp.
