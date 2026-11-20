# CONTEXT — Firebase Google Auth

P12 source20/11: initializeAuth chọn persistent IndexedDB rồi localStorage, không session-only. AccountPanel không await setPersistence trước popup để giữ user gesture Safari. Hook giữ uid đã dùng khi Auth null, ngừng sync đến khi Auth đúng uid, báo mất phiên; lỗi callback/init không mở guest. Marker + legacy lookup giữ sổ khi nâng cấp, nhiều uid không đoán; explicit logout đặt marker guest trước signOut, lỗi khôi phục marker. Banner guest/mất phiên và copy offline nói đúng trạng thái. Tests Chromium/WebKit Auth fixtures bao phủ null/callback/init/reopen/explicit logout; chưa kiểm Google thật/long-session/iPhone P12. Không biết nguyên nhân nền tảng khiến Auth cũ mất, không hứa iOS không xóa storage. docs/phases/P12.

P11 follow-up20/11: người dùng đăng nhập Console thành công; read-only Authentication đối chiếu uid với tài khoản và Firestore state còn dữ liệu đã nhập trước sự cố. Đây là đăng nhập Console, không chứng minh Auth app iPhone đã khôi phục. Candidate hợp cloud+guest đã tạo/kiểm thử local, dữ liệu riêng ngoài Git. Chưa sửa Auth/notice/deploy; lý do Auth điện thoại trở về guest chưa xác định. Chi tiết docs/phases/P11.

P11 điều tra20/11/2026: screenshot người dùng iPhone/PWA hiện Trên thiết bị và Đăng nhập với Google, xác nhận phiên UI là guest. Không biết vì sao Auth không khôi phục; không kết luận token hết hạn hay iOS xóa storage. Callback Auth null/error mở guest; không xóa local uid cũ. Playwright Chromium/WebKit fixture xác nhận chuyển về đúng uid mở lại dữ liệu local vẫn còn. Notice offline ở app-shell không kiểm user, chữ “đã đăng nhập Google” không xác nhận Auth/cloud và cần sửa theo trạng thái. Chưa sửa source/deploy/khôi phục điện thoại. Hướng xử lý và giới hạn tại docs/phases/P11; hosted Firebase/backup/PITR NOT RUN, CLI chỉ đọc bị lỗi xác thực.

Release P9,11/11/2026: b1e641e deploy SUCCESS, Actions42949633931. Hosted guest account Settings Chromium/WebKit/axe320390 PASS; sync/error/retry dùng Auth/transport fixture và giữ nháp PASS cả hai engines. Không đăng nhập/ghi cloud thật cho P9; Firebase tài khoản thật NOT RUN. Chi tiết docs/phases/P9.

P9,11/11/2026: AccountPanel nhận status?: ReactNode từ app-shell để chứa thông báo mất mạng/local/Firebase và nút thử lại tại mục Tài khoản & đồng bộ. Nhãn Local + Firebase/Trên thiết bị chuyển từ header vào panel; status nằm sau mô tả tài khoản, có role status và CSS xuống dòng trong panel. Auth, đăng xuất phục hồi lỗi mở sổ, scope local theo uid và điều kiện xác nhận server không đổi. Nghiệm thu/release docs/phases/P9; fixture không thay thế Firebase tài khoản thật.

Implemented P2, 09/11/2026. account-panel.tsx dùng Firebase signInWithPopup Google và signOut, không lưu token tự viết. lib/firebase/client.ts initialize singleton browser config từ NEXT_PUBLIC_*; thiếu config thì local mode ghi nhãn rõ.

Firebase project workingtimetracking-f974c, Google provider đã Enabled, GitHub Pages hostname authorized. Đã được người dùng duyệt email hỗ trợ và cấu hình Google. Sổ owner do data hook và Firestore rules bảo vệ; đổi user không trộn dữ liệu. Không có password hay service-account trong code. Mọi Google user có sổ riêng; không có admin allowlist.

Console configuration verified; lần đăng nhập thật và ghi cloud sẽ ghi kết quả cụ thể tại docs/phases/P2/REPORT.md. Không coi E2E local mode là cloud Auth test. Popup lỗi có thông báo cho phép popup/kiểm domain và retry. Browser sign-in có thể yêu cầu người dùng hoàn thành xác thực Google.

Live follow-up: đăng nhập Google bằng tài khoản thật, lưu default settings và đọc lại Firestore qua app local static subpath đã PASS09/11/2026. Không tạo ca làm giả. Hosted Pages smoke ghi ở P2 sau deploy; token refresh dài hạn chưa kiểm.

Hosted follow-up: Google login trên https://khoatdwork.github.io/WorkingTimeTracking/ PASS, cùng ledger default settings đọc thành công. Browser Chromium/WebKit HTTPS full app suite PASS, không dùng Auth giả để tuyên bố live sign-in. Chi tiết P2/REPORT.md.

P5: sau auth hydration hook mở bản local theo uid rồi tự sync. Guest local có dữ liệu được chuyển một lần vào tài khoản đầu tiên, không tái upload cho tài khoản khác. Đăng xuất mở local guest riêng, không đưa sổ tài khoản trước sang tài khoản sau. AccountPanel giải thích lưu local trước và xác nhận Firebase riêng. Tests auth switch dùng fixture, hosted Google auth cho P5 NOT RUN; bằng chứng P2 là lịch sử, không phải nghiệm thu luồng P5.
