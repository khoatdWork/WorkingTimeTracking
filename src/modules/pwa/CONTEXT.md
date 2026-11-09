# CONTEXT — PWA

P3, 09/11/2026. Manifest src/app/manifest.ts tạo id/start_url/scope theo NEXT_PUBLIC_BASE_PATH. PNG192/512, maskable512 (nền kín, clock nằm trong safe circle), Apple180 được render từ public/icon.svg; không thêm dependency.

scripts/build-pwa.mjs chạy sau next build, đọc scope từ manifest đã export, liệt kê public shell/icons/font/CSS/JS, hash nội dung + worker template để đặt cache phiên bản, tạo out/sw.js. Không chỉnh out bằng tay. Worker.js là template có placeholder; chỉ out/sw.js là worker có thể deploy. Dev không đăng ký worker.

Worker precache toàn bộ bằng cache.addAll; thiếu tệp thì install thất bại và xóa cache chưa hoàn chỉnh. Cache-first shell để release đang mở luôn đi cùng assets của nó. Chỉ GET public build URLs trong scope, không cache runtime, Auth/Firestore hay trang khác cùng GitHub Pages origin. Không skipWaiting tự động; cập nhật tự nhiên sau đóng hết cửa sổ, hoặc người dùng xác nhận trong Settings.

Khi cập nhật có cửa sổ đang mở, giữ cache cũ để các tab còn bản nháp tải được assets cũ. Không reload tab khác; chỉ tab đã chấp nhận cập nhật reload trên controllerchange. Lần activate không còn clients sẽ dọn các cache cũ đúng prefix/scope. shortcut: cache cũ có thể còn trên thiết bị nếu mọi lần cập nhật đều ép áp dụng khi tab mở; dọn lại ở lần activate không có clients, ưu tiên tránh làm hỏng tab cũ.

use-pwa.ts: native install prompt + standalone/online subscriptions, register updateViaCache=none, kiểm update khi quay lại cửa sổ/có mạng. PwaPanel: shadcn buttons/AlertDialog, hướng dẫn Safari iOS, offline scope nói rõ. Sổ thiết bị offline; cloud không có persistent snapshot/queue và cần mạng. Không tự chuyển sổ, không cache dữ liệu riêng trong Cache Storage.

Tests tests/e2e/pwa.py: Chromium native installability diagnostics, manifest/icons/scope, offline persistence/reopen, axe Settings320, two-release update và failed install. WebKit offline navigation kiểm bằng server từ chối mọi network response vì Playwright set_offline gây internal error trước khi gọi worker; offline status event vẫn kiểm riêng. Hosted WebKit chỉ smoke online; Chromium kiểm offline HTTPS. Không coi giả lập là điện thoại thật.
