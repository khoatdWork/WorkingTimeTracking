# Firebase + GitHub Pages

## Môi trường đang dùng

- Repository: https://github.com/khoatdWork/WorkingTimeTracking (public, người dùng đã chọn).
- Pages: https://khoatdwork.github.io/WorkingTimeTracking/
- Firebase: https://console.firebase.google.com/project/workingtimetracking-f974c/overview
- Firestore `(default)`, Standard, Singapore `asia-southeast1`, Spark miễn phí. Không bật Analytics/Gemini, không nâng billing.
- Web app “Đủ giờ Web”; Auth Google với display name “Đủ giờ”, email hỗ trợ theo cấu hình người dùng đã duyệt.
- Authorized domains có `khoatdwork.github.io`, hai domain mặc định Firebase và localhost.
- Firestore Rules P12 đã publish từ `firestore.rules` ngày20/11/2026 lúc21:27ICT. Mỗi user chỉ đọc/ghi state của mình và đọc/tạo `users/{uid}/trackerHistory/{version}`; anonymous bị từ chối. State version tăng đúng1, mỗi lần thay phải giữ nguyên state trước trong history, history cấm sửa/xóa. Rules kiểm shape top-level/settings/version. Chi tiết từng ngày/ca được validator app kiểm; đây là sổ tự ghi của chủ tài khoản, không phải nguồn xác thực cho payroll. Bằng chứng release `4e94360` tại docs/phases/P12.

## Khi thay Firebase project

1. Tạo Firebase project gói Spark; không cần Analytics.
2. Add Web app, lấy config public.
3. Tạo Firestore production mode (deny all), chọn location. Enable Authentication Google và email hỗ trợ.
4. Thêm hostname Pages vào Authentication → Settings → Authorized domains. Không nhập path hoặc protocol.
5. Publish nội dung firestore.rules qua Firebase Console, hoặc dùng CLI đã đăng nhập:

```powershell
npm run firebase:login
npm run firebase:rules -- --project YOUR_PROJECT_ID
```

6. Điền `.env.local` cho local; trên GitHub Settings → Secrets and variables → Actions → Variables, điền sáu `NEXT_PUBLIC_FIREBASE_*` tương ứng .env.example (API key, auth domain, project ID, storage bucket, messaging sender ID, app ID; có 6 giá trị Firebase).
7. Chạy lại workflow bằng Actions → Verify and deploy GitHub Pages → Run workflow. Các biến NEXT_PUBLIC được nhúng lúc build; đổi biến cần build lại.

Không đưa service account/private key/admin token vào browser hoặc repository. Auth Google chỉ cần Firebase web config.

## Pages

Repository Settings → Pages → Source: GitHub Actions. Workflow `.github/workflows/pages.yml` đặt basePath `/WorkingTimeTracking`. Nếu đổi repository name, sửa basePath và link README; hostname auth giữ nguyên nếu vẫn cùng GitHub account. Không dùng repository Pages `username.github.io` với basePath này.

## Chuyển dữ liệu lên cloud

P12 thay chính sách P5: lưu local trước, giữ owner khi Auth mất phiên; chỉ Đăng xuất chủ động mới mở guest. Guest claim một lần và giữ bản gốc. Ghép ngày sửa độc lập theo baseline đã xác nhận; xung đột giữ cả hai, dừng upload. Không có baseline thì chỉ hợp ngày không trùng/giống hệt. Cloud missing/lùi version bị chặn. Không đưa dữ liệu tài khoản trước sang tài khoản sau.

Vẫn có Cài đặt → Xuất/Nhập JSON khi cần sao lưu ngoài trình duyệt. Dialog import nói rõ thay thế local rồi tự đồng bộ tài khoản; nên backup sổ đích trước khi nhập. PWA đã cài cần cập nhật trong Cài đặt → Cài ứng dụng → Cập nhật ứng dụng để dùng luồng P12.

## Vận hành

- Nên xuất JSON định kỳ trước khi thay cài đặt hoặc nhập dữ liệu.
- Cloud xác nhận cần mạng; app vẫn lưu local khi offline và tự sync khi mở app/đăng nhập/có mạng/quay lại app. Chỉ báo đồng bộ sau server ack. Lỗi giữ local và cho thử lại. Xung đột cùng ngày không chọn bên thắng; xuất hai bản/chọn bản có xác nhận tại Tài khoản & đồng bộ.
- Triển khai P12 phải publish rules cùng ứng dụng: owner-only trackerHistory, lưu bản server trước trong cùng transaction thay state; cấm sửa/xóa history. Rules mới sẽ từ chối client PWA cũ không lưu history; client giữ local pending và cần cập nhật. Không đưa user data/service credentials vào release. Quy trình và trạng thái thực ở docs/phases/P12.
- Giới hạn Spark có thể thay đổi; xem usage trong Console, app không tự nâng gói.
- Firestore single document phù hợp sổ cá nhân, có giới hạn 850 KB tại app. Cần tách theo tháng trước khi vượt giới hạn.
