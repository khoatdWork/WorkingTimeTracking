# CONTEXT — PWA

Release P9,11/11/2026: b1e641e deploy SUCCESS, Actions42949633931, cache Pages du-gio-pwa-%2FWorkingTimeTracking%2F-13ad89bf21be6143 khớp CI. Hosted Chromium offline HTTPS PASS cả vị trí notice tại tài khoản và reconnect; WebKit manifest/icons/worker/ready smoke PASS. Hosted WebKit offline navigation NOT RUN theo giới hạn automation; local refusal-based offline regression PASS. Thiết bị vật lý/Firebase tài khoản thật NOT RUN, chi tiết docs/phases/P9.

P9,11/11/2026: thông báo mất mạng chuyển từ shell toàn cục vào Cài đặt → Tài khoản & đồng bộ. usePwa, service worker, offline persistence và thông báo cập nhật có hành động không đổi. Browser regression kiểm notice ẩn tại Hôm nay, hiện tại tài khoản khi offline và biến mất tại đó khi có mạng. Kết quả thực và release docs/phases/P9.

Release11/11/2026: P7/P8 ecf7375 đã deploy, Actions42946545547 SUCCESS, cache Pages du-gio-pwa-%2FWorkingTimeTracking%2F-39d7eb10f41038fa khớp CI. Hosted Chromium manifest/installability/offline checkin/reload/newwindow/reconnect/cache privacy PASS; WebKit manifest/icons/worker/ready PASS theo giới hạn offline đã ghi. Cập nhật qua Settings mới đã PASS trên CI với fixture2release; không xem là kiểm cập nhật trên thiết bị vật lý. Chi tiết docs/phases/P8.

P8,10/11/2026: PwaPanel chỉ mở khi chọn Cài đặt → Cài ứng dụng. Notice phiên bản mới mở thẳng mục này kể cả từ root Cài đặt hoặc mục khác, qua guard nếu đang sửa giờ/ngày lễ. Nội dung/cơ chế update/install/service worker không đổi; không tự reload nháp. Kiểm tra hồi quy update/offline ghi tại docs/phases/P8. Chưa deploy P8.

P3, 09/11/2026. Manifest src/app/manifest.ts tạo id/start_url/scope theo NEXT_PUBLIC_BASE_PATH. PNG192/512, maskable512 (nền kín, clock nằm trong safe circle), Apple180 được render từ public/icon.svg; không thêm dependency.

scripts/build-pwa.mjs chạy sau next build, đọc scope từ manifest đã export, liệt kê public shell/icons/font/CSS/JS, hash nội dung + worker template để đặt cache phiên bản, tạo out/sw.js. Không chỉnh out bằng tay. Worker.js là template có placeholder; chỉ out/sw.js là worker có thể deploy. Dev không đăng ký worker.

Worker precache toàn bộ bằng cache.addAll; thiếu tệp thì install thất bại và xóa cache chưa hoàn chỉnh. Cache-first shell để release đang mở luôn đi cùng assets của nó. Chỉ GET public build URLs trong scope, không cache runtime, Auth/Firestore hay trang khác cùng GitHub Pages origin. Không skipWaiting tự động; cập nhật tự nhiên sau đóng hết cửa sổ, hoặc người dùng xác nhận trong Settings.

Khi cập nhật có cửa sổ đang mở, giữ cache cũ để các tab còn bản nháp tải được assets cũ. Không reload tab khác; chỉ tab đã chấp nhận cập nhật reload trên controllerchange. Lần activate không còn clients sẽ dọn các cache cũ đúng prefix/scope. shortcut: cache cũ có thể còn trên thiết bị nếu mọi lần cập nhật đều ép áp dụng khi tab mở; dọn lại ở lần activate không có clients, ưu tiên tránh làm hỏng tab cũ.

use-pwa.ts: native install prompt + standalone/online subscriptions, register updateViaCache=none, kiểm update khi quay lại cửa sổ/có mạng. PwaPanel: shadcn buttons/AlertDialog, hướng dẫn Safari iOS. P5 thay giới hạn sổ cloud cần mạng: localStorage có bản theo uid và cờ chờ sync, dùng được offline; có mạng/đăng nhập/mở app thì tự sync. Firebase SDK vẫn không bật persistent offline queue. Worker không cache dữ liệu riêng trong Cache Storage. Cập nhật các tab/PWA cũ để dùng chung luồng local-first mới.

Tests tests/e2e/pwa.py: Chromium native installability diagnostics, manifest/icons/scope, offline persistence/reopen, axe Settings320, two-release update và failed install. WebKit offline navigation kiểm bằng server từ chối mọi network response vì Playwright set_offline gây internal error trước khi gọi worker; offline status event vẫn kiểm riêng. Hosted WebKit chỉ smoke online; Chromium kiểm offline HTTPS. Không coi giả lập là điện thoại thật.
