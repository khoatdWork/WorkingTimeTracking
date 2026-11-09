# Đủ giờ

Theo dõi thời gian làm việc và WFH, cân đối đủ giờ trong tháng. Giao diện tiếng Việt, thiết kế mobile 320–430px theo cấu trúc project QuanLyTaiSan.

- Web: https://khoatdwork.github.io/WorkingTimeTracking/
- Firebase project: `workingtimetracking-f974c`, gói Spark, Firestore Standard ở Singapore (`asia-southeast1`).
- Next.js App Router/static export, React, TypeScript strict, shadcn/ui Radix Nova, Be Vietnam Pro. Firebase Auth Google và Firestore; GitHub Actions deploy Pages.

## Sử dụng

1. Vào Cài đặt, đăng nhập Google để lưu vào tài khoản Firebase. Khi chưa đăng nhập, dữ liệu chỉ ở trình duyệt hiện tại và có nhãn “Trên thiết bị”. Hai sổ tách riêng; dùng xuất/nhập JSON nếu cần chuyển dữ liệu.
2. Chọn Văn phòng hoặc Work from home, bấm “Đã lên công ty” / “Bắt đầu WFH”. Khi về, bấm kết thúc. Đồng hồ vẫn tính khi đóng tab hoặc tắt máy vì lưu thời điểm bắt đầu, không dựa vào số lần timer chạy.
3. Mặc định tự trừ **60 phút nghỉ trưa một lần/ngày**. Không cần tạm dừng trong giờ nghỉ trưa. Nút tạm dừng dùng cho thời gian nghỉ thêm ngoài nghỉ trưa; tiếp tục sẽ mở ca mới.
4. Với WFH, gửi request qua kênh công ty rồi đánh dấu Chưa gửi / Đã gửi / Đã duyệt tại app. Giới hạn mặc định 3 ngày mỗi tuần; có cảnh báo vượt giới hạn và request chưa gửi. App không tự gửi request cho công ty.
5. Quên chấm công: vào Lịch sử, chọn ngày và Bổ sung. Có nhiều ca/ngày, chỉnh giờ đến giây, ghi chú, nghỉ phép và ngày lễ. Nghỉ/lễ được đánh dấu thủ công, không có lịch lễ tự động.
6. Xem Báo cáo và đối chiếu tổng. Có xuất JSON giữ đầy đủ dữ liệu và CSV các ca với thời điểm UTC.

## Cách tính

- Ngày theo Việt Nam UTC+7. Ngày thường thứ Hai–thứ Sáu cần 8 giờ; cuối tuần không có chỉ tiêu nhưng vẫn ghi nhận giờ làm bù.
- Giờ làm ròng = tổng ca làm trong ngày − nghỉ trưa (không âm). Những khoảng tạm dừng không nằm trong ca nên không cộng giờ.
- 6 giờ hôm nay + 10 giờ ngày mai = đủ 16 giờ hai ngày. Chỉ bù trong cùng tháng; không mang giờ dư tháng trước sang tháng sau.
- **Thiếu đến hôm nay** đối chiếu các ngày công từ đầu kỳ tới hết hôm nay, bao gồm mục tiêu cả ngày hôm nay. **Còn lại cả tháng** = chỉ tiêu cả tháng − giờ đã làm, gồm cả những ngày chưa đến.
- Tính bằng giây nguyên, hiển thị `giờ:phút:giây`. Thiếu 1 giây vẫn còn thiếu. Lịch sử lưu timestamp chính xác; không làm tròn tăng giờ.
- Ca qua nửa đêm chia thời gian theo ngày, trừ nghỉ theo từng ngày. Ca kết thúc tối đa 24 giờ. Nếu quên kết thúc lâu hơn, chỉnh lại giờ về trong Lịch sử.
- Cài đặt giờ/nghỉ/WFH áp dụng lại cho toàn bộ lịch sử. Ngày đã có ca cần chỉnh nơi làm trong màn chỉnh ngày.
- WFH được đếm theo ngày đã chọn WFH (gồm ngày lên kế hoạch), không đếm theo số ca và không tính nghỉ phép/ngày lễ.

## Chạy local

Node **26.4.0**, npm **11.17.0**.

```powershell
npm ci
Copy-Item .env.example .env.local
# Điền Firebase web config, để NEXT_PUBLIC_BASE_PATH trống khi chạy local
npm run dev
```

Mở http://localhost:3000. Nếu không điền Firebase, app dùng sổ trên thiết bị. Không có dữ liệu mẫu mặc định.

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm start
```

Kiểm thử browser cần Python và Playwright; `test:e2e` tự mở static server cổng 3100 và tạo dữ liệu giả trong browser context riêng, không ghi Firebase.

```powershell
python -m pip install -r requirements-dev.txt
python -m playwright install chromium webkit
npm run test:e2e
```

Nếu build cho subpath, dùng cùng biến khi test:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/WorkingTimeTracking'
npm run build
npm run test:e2e
```

Firestore rules tests cần Java 21 trở lên:

```powershell
npm run test:db
```

## Cấu trúc

```text
src/app/                    Next.js route, layout, global styles
src/components/ui/          shadcn/ui cài bằng CLI
src/lib/firebase/           Firebase browser config
src/modules/app-shell/      navigation, state composition, backup UI
src/modules/auth/           Google login/logout
src/modules/tracking/core/  time/date/validation thuần TypeScript
src/modules/tracking/data/  local/cloud persistence + session hook
src/modules/tracking/       today/history/reports/day editor
src/modules/settings/      settings form
tests/unit/                 calculation and storage edge cases
tests/database/             real Firestore emulator rules tests
tests/e2e/                  Python Playwright Chromium/WebKit
docs/phases/                test, review, audit evidence
```

Mỗi module có CONTEXT.md. AGENTS.md, AGENT.md, PLAN.md, Design.md dùng để tiếp tục phát triển.

## Firebase và deploy

Đã tạo Firebase project, web app, Firestore và bật Google sign-in. GitHub repository variables chứa Firebase **web config public**, không phải admin credentials. Mọi dữ liệu riêng được bảo vệ bằng Firebase Auth + Firestore Rules, không nhờ giấu web API key.

Xem [hướng dẫn cấu hình/deploy](docs/deployment/FIREBASE-GITHUB.md). Push `main` chạy lint, typecheck, unit, Firestore emulator, static build và E2E Chromium/WebKit trước khi deploy GitHub Pages. Không deploy fixture hay dữ liệu kiểm thử.

## Giới hạn

Sổ cá nhân lưu một document Firestore theo user, ghi transaction với version để từ chối ghi đè khi thiết bị khác đã thay đổi. Đây là lựa chọn cho một người dùng; dữ liệu app giới hạn 850 KB để chừa khoảng dưới giới hạn 1 MiB của Firestore. Khi gần đầy cần xuất/lưu trữ năm cũ; nếu dùng dài hạn với nhiều dữ liệu, chuyển sang document theo tháng. Cloud cần mạng để ghi, không báo thành công trước khi server xác nhận. Đồng hồ dùng giờ của thiết bị, nên thiết bị cần đặt giờ đúng. Không phải bảng chấm công chính thức của công ty.

Kết quả kiểm thử thực tế và phần chưa kiểm tra được ghi trong docs/phases/P2/. Không coi kiểm thử browser giả lập là kiểm thử điện thoại thật.
