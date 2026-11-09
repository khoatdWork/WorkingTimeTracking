# Firebase + GitHub Pages

## Môi trường đang dùng

- Repository: https://github.com/khoatdWork/WorkingTimeTracking (public, người dùng đã chọn).
- Pages: https://khoatdwork.github.io/WorkingTimeTracking/
- Firebase: https://console.firebase.google.com/project/workingtimetracking-f974c/overview
- Firestore `(default)`, Standard, Singapore `asia-southeast1`, Spark miễn phí. Không bật Analytics/Gemini, không nâng billing.
- Web app “Đủ giờ Web”; Auth Google với display name “Đủ giờ”, email hỗ trợ theo cấu hình người dùng đã duyệt.
- Authorized domains có `khoatdwork.github.io`, hai domain mặc định Firebase và localhost.
- Firestore rules đã publish từ firestore.rules. Mỗi user chỉ đọc/ghi `users/{uid}/tracker/state`, anonymous bị từ chối; version tăng đúng 1. Rules kiểm shape top-level/settings/version. Chi tiết từng ngày/ca được validator app kiểm; đây là sổ tự ghi của chủ tài khoản, không phải nguồn xác thực cho payroll.

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

P5: luôn lưu local trước. Đăng nhập Google tự nhận dữ liệu guest trên thiết bị một lần vào tài khoản đầu tiên và đồng bộ Firebase. Thiết bị chưa có dữ liệu local tải sổ Firebase về. Local chưa đồng bộ được ưu tiên tải toàn bộ sổ lên; local đã đồng bộ nhận cập nhật Firebase. Bản local tách theo uid; đăng xuất mở guest riêng, không chuyển dữ liệu tài khoản trước sang tài khoản sau.

Vẫn có Cài đặt → Xuất/Nhập JSON khi cần sao lưu ngoài trình duyệt. Dialog import nói rõ thay thế local rồi tự đồng bộ tài khoản; nên backup sổ đích trước khi nhập. PWA đã cài cần cập nhật trong Cài đặt → Cài ứng dụng → Cập nhật ứng dụng để dùng luồng P5.

## Vận hành

- Nên xuất JSON định kỳ trước khi thay cài đặt hoặc nhập dữ liệu.
- Cloud xác nhận cần mạng; app vẫn lưu local khi offline và tự sync khi mở app/đăng nhập/có mạng/quay lại app. Chỉ báo đồng bộ sau server ack. Lỗi giữ local và cho thử lại. Khi cả hai phía thay đổi, toàn bộ local chưa đồng bộ được ưu tiên, không merge từng ngày.
- Giới hạn Spark có thể thay đổi; xem usage trong Console, app không tự nâng gói.
- Firestore single document phù hợp sổ cá nhân, có giới hạn 850 KB tại app. Cần tách theo tháng trước khi vượt giới hạn.
