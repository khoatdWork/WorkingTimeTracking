# Đủ giờ

Theo dõi thời gian làm việc và WFH, cân đối đủ giờ trong tháng. Giao diện tiếng Việt, thiết kế mobile 320–430px theo cấu trúc project QuanLyTaiSan.

- Web: https://khoatdwork.github.io/WorkingTimeTracking/
- Firebase project: `workingtimetracking-f974c`, gói Spark, Firestore Standard ở Singapore (`asia-southeast1`).
- Next.js App Router/static export, React, TypeScript strict, shadcn/ui Radix Nova, Be Vietnam Pro. Firebase Auth Google và Firestore; GitHub Actions deploy Pages.

## Sử dụng

1. Vào Cài đặt, đăng nhập Google để lưu vào tài khoản Firebase. Khi chưa đăng nhập, dữ liệu chỉ ở trình duyệt hiện tại và có nhãn “Trên thiết bị”. Hai sổ tách riêng; dùng xuất/nhập JSON nếu cần chuyển dữ liệu.
2. Với Văn phòng: bấm “Đã lên công ty”, khi về bấm kết thúc. Đồng hồ vẫn tính khi đóng tab hoặc tắt máy vì lưu thời điểm bắt đầu. Với **Work from home: chỉ chọn 8 giờ hoặc 10 giờ**, không cần bắt đầu/kết thúc. Chọn mức khác sẽ thay số giờ trong ngày đó, không cộng dồn.
3. Ngày văn phòng ghi theo ca mặc định trừ **60 phút nghỉ trưa một lần/ngày**. Không cần tạm dừng trong giờ nghỉ trưa. Nút tạm dừng dùng cho nghỉ thêm. **8/10 giờ WFH đã là giờ làm ròng**, không trừ thêm nghỉ trưa, kể cả khi đổi cài đặt.
4. Với WFH, gửi request qua kênh công ty rồi đánh dấu Chưa gửi / Đã gửi / Đã duyệt tại app. Giới hạn mặc định 3 ngày mỗi tuần; có cảnh báo vượt giới hạn và request chưa gửi. App không tự gửi request cho công ty.
5. Quên chấm công: vào Lịch sử, chọn ngày và Bổ sung. Văn phòng có nhiều ca/ngày, chỉnh giờ đến giây; WFH chọn 8/10 giờ. Có ghi chú, nghỉ phép và ngày lễ thủ công. Ngày tương lai chỉ lên kế hoạch/request WFH, chưa ghi giờ. Các ca WFH cũ vẫn được giữ và tính như trước; sửa ghi chú/request không tự đổi giờ. Chuyển ca cũ sang giờ WFH cố định hoặc bỏ giờ WFH để đổi loại ngày đều cần xác nhận.
6. Xem Báo cáo và đối chiếu tổng. Có xuất JSON giữ đầy đủ dữ liệu và CSV các ca với thời điểm UTC.

## Cách tính

- Ngày theo Việt Nam UTC+7. Ngày thường thứ Hai–thứ Sáu cần 8 giờ; cuối tuần không có chỉ tiêu nhưng vẫn ghi nhận giờ làm bù.
- Ngày ghi theo ca: giờ làm ròng = tổng ca trong ngày − nghỉ trưa (không âm). WFH cố định = đúng mức đã chọn 8 hoặc 10 giờ, không tạo ca giả, không trừ nghỉ trưa. Không cho cộng thêm ca vào ngày WFH cố định, kể cả ca từ ngày trước đi qua nửa đêm.
- 6 giờ hôm nay + 10 giờ ngày mai = đủ 16 giờ hai ngày. Chỉ bù trong cùng tháng; không mang giờ dư tháng trước sang tháng sau.
- **Thiếu đến hôm nay** đối chiếu các ngày công từ đầu kỳ tới hết hôm nay, bao gồm mục tiêu cả ngày hôm nay. **Còn lại cả tháng** = chỉ tiêu cả tháng − giờ đã làm, gồm cả những ngày chưa đến.
- Tính bằng giây nguyên, hiển thị `giờ:phút:giây`. Thiếu 1 giây vẫn còn thiếu. Lịch sử lưu timestamp chính xác; không làm tròn tăng giờ.
- Ca qua nửa đêm chia thời gian theo ngày, trừ nghỉ theo từng ngày. Ca kết thúc tối đa 24 giờ. Nếu quên kết thúc lâu hơn, chỉnh lại giờ về trong Lịch sử.
- Cài đặt giờ/nghỉ/WFH áp dụng lại cho toàn bộ lịch sử. Ngày đã có ca cần chỉnh nơi làm trong màn chỉnh ngày.
- WFH được đếm theo ngày đã chọn WFH (gồm ngày lên kế hoạch), không đếm theo số ca và không tính nghỉ phép/ngày lễ.

## Cài ứng dụng và dùng offline

- Mở web có mạng một lần, vào **Cài đặt → Cài ứng dụng**, chờ dòng “Giao diện đã sẵn sàng mở khi mất mạng”. Chrome/Edge có thể hiện nút **Cài Đủ giờ**; nếu chưa hiện, dùng mục Cài ứng dụng/Thêm vào màn hình chính trong menu trình duyệt.
- iPhone/iPad: mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính. App có icon riêng và mở dạng standalone.
- **Sổ trên thiết bị** có thể vào/về, tạm dừng, chỉnh ngày và xem báo cáo khi mất mạng, kể cả đóng rồi mở lại app. Dữ liệu chỉ nằm trong trình duyệt/ứng dụng đó; hãy xuất JSON định kỳ. Cài app không tự chuyển dữ liệu giữa trình duyệt, thiết bị hoặc sổ Firebase.
- **Sổ Firebase cần mạng để mở và lưu.** Không có hàng đợi ghi offline hoặc tự chuyển sang sổ thiết bị. Nếu lưu thất bại, giữ bản nháp, kết nối lại và thử lại. Không báo đồng bộ trước khi server xác nhận.
- Khi có phiên bản mới, mở Cài đặt, lưu thay đổi rồi chọn **Cập nhật ứng dụng**. App hỏi trước khi tải lại cửa sổ hiện tại; các cửa sổ khác giữ bản nháp và ca đang chạy không bị kết thúc. Đóng hết cửa sổ cũng cho phép phiên bản đã tải tự áp dụng ở lần mở sau.

PWA chỉ đăng ký service worker trong production build (HTTPS hoặc localhost). Khi chuyển một cổng localhost đã chạy production sang `npm run dev`, dùng Application → Service Workers → Unregister và xóa Cache Storage nếu trình duyệt vẫn mở bản cũ. Không xóa Local Storage nếu cần giữ sổ trên thiết bị.

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
src/modules/pwa/            installation, offline shell, safe updates
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

Kết quả Firebase/release ban đầu ở docs/phases/P2/, PWA ở docs/phases/P3/. Không coi kiểm thử browser giả lập là kiểm thử điện thoại thật.
