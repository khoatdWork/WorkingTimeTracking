# CONTEXT — Firebase Google Auth

Release P9,11/11/2026: b1e641e deploy SUCCESS, Actions42949633931. Hosted guest account Settings Chromium/WebKit/axe320390 PASS; sync/error/retry dùng Auth/transport fixture và giữ nháp PASS cả hai engines. Không đăng nhập/ghi cloud thật cho P9; Firebase tài khoản thật NOT RUN. Chi tiết docs/phases/P9.

P9,11/11/2026: AccountPanel nhận status?: ReactNode từ app-shell để chứa thông báo mất mạng/local/Firebase và nút thử lại tại mục Tài khoản & đồng bộ. Nhãn Local + Firebase/Trên thiết bị chuyển từ header vào panel; status nằm sau mô tả tài khoản, có role status và CSS xuống dòng trong panel. Auth, đăng xuất phục hồi lỗi mở sổ, scope local theo uid và điều kiện xác nhận server không đổi. Nghiệm thu/release docs/phases/P9; fixture không thay thế Firebase tài khoản thật.

Implemented P2, 09/11/2026. account-panel.tsx dùng Firebase signInWithPopup Google và signOut, không lưu token tự viết. lib/firebase/client.ts initialize singleton browser config từ NEXT_PUBLIC_*; thiếu config thì local mode ghi nhãn rõ.

Firebase project workingtimetracking-f974c, Google provider đã Enabled, GitHub Pages hostname authorized. Đã được người dùng duyệt email hỗ trợ và cấu hình Google. Sổ owner do data hook và Firestore rules bảo vệ; đổi user không trộn dữ liệu. Không có password hay service-account trong code. Mọi Google user có sổ riêng; không có admin allowlist.

Console configuration verified; lần đăng nhập thật và ghi cloud sẽ ghi kết quả cụ thể tại docs/phases/P2/REPORT.md. Không coi E2E local mode là cloud Auth test. Popup lỗi có thông báo cho phép popup/kiểm domain và retry. Browser sign-in có thể yêu cầu người dùng hoàn thành xác thực Google.

Live follow-up: đăng nhập Google bằng tài khoản thật, lưu default settings và đọc lại Firestore qua app local static subpath đã PASS09/11/2026. Không tạo ca làm giả. Hosted Pages smoke ghi ở P2 sau deploy; token refresh dài hạn chưa kiểm.

Hosted follow-up: Google login trên https://khoatdwork.github.io/WorkingTimeTracking/ PASS, cùng ledger default settings đọc thành công. Browser Chromium/WebKit HTTPS full app suite PASS, không dùng Auth giả để tuyên bố live sign-in. Chi tiết P2/REPORT.md.

P5: sau auth hydration hook mở bản local theo uid rồi tự sync. Guest local có dữ liệu được chuyển một lần vào tài khoản đầu tiên, không tái upload cho tài khoản khác. Đăng xuất mở local guest riêng, không đưa sổ tài khoản trước sang tài khoản sau. AccountPanel giải thích lưu local trước và xác nhận Firebase riêng. Tests auth switch dùng fixture, hosted Google auth cho P5 NOT RUN; bằng chứng P2 là lịch sử, không phải nghiệm thu luồng P5.
