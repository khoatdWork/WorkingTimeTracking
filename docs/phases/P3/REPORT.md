# P3 — PWA

Request: kiểm tra và hoàn thiện PWA. Audit ban đầu không có manifest, worker, PNG/install metadata hoặc offline shell.

Implemented: installable manifest/regular-maskable-Apple icons, standalone/safe areas, cached application shell, native install prompt và hướng dẫn theo browser, offline status, explicit confirmed update. Cache riêng basePath; hash theo nội dung build; giữ phiên bản cũ nếu download mới thiếu tệp. Reload chỉ cửa sổ đã đồng ý cập nhật, giữ bản nháp cửa sổ khác.

Sổ thiết bị dùng offline. Sổ Firebase vẫn cần mạng để đọc/ghi; guard báo lỗi ngay khi offline, không queue hoặc tự đổi sổ. Không cache dữ liệu user trong service worker. Không sửa cách tính giờ hoặc Firestore Rules.

Verification và release: xem test-results.md. Chưa kiểm trên điện thoại vật lý, iOS Home Screen thật hoặc phiên Google dài hạn trong standalone. Không có live work-session fixture nào ghi vào Firebase thật.

Completed09/11/2026: source d86f37d, CI42566267095 verify/deploy SUCCESS; live https://khoatdwork.github.io/WorkingTimeTracking/. Hosted regression cả2 engines PASS; HTTPS Chromium installability/offline full checks PASS, WebKit hosted online PWA smoke PASS + local network-refusal offline checks PASS. Không tuyên bố đã cài app trên điện thoại thật.
