# CONTEXT — Firebase Google Auth

Implemented P2, 09/11/2026. account-panel.tsx dùng Firebase signInWithPopup Google và signOut, không lưu token tự viết. lib/firebase/client.ts initialize singleton browser config từ NEXT_PUBLIC_*; thiếu config thì local mode ghi nhãn rõ.

Firebase project workingtimetracking-f974c, Google provider đã Enabled, GitHub Pages hostname authorized. Đã được người dùng duyệt email hỗ trợ và cấu hình Google. Sổ owner do data hook và Firestore rules bảo vệ; đổi user không trộn dữ liệu. Không có password hay service-account trong code. Mọi Google user có sổ riêng; không có admin allowlist.

Console configuration verified; lần đăng nhập thật và ghi cloud sẽ ghi kết quả cụ thể tại docs/phases/P2/REPORT.md. Không coi E2E local mode là cloud Auth test. Popup lỗi có thông báo cho phép popup/kiểm domain và retry. Browser sign-in có thể yêu cầu người dùng hoàn thành xác thực Google.
