# P2 — Firebase và GitHub release

Implementation09/11/2026. Firebase project workingtimetracking-f974c created under signed-in account, Spark, Firestore Standard Singapore, web app registered. Google provider Enabled, authorized domain khoatdwork.github.io verified in Console. Owner-only rules published from tested source. User approved public repository/Pages and Google configuration.

Firestore emulator isolation/settings/version tests PASS. Local and subpath browser suites PASS, final checks continue during release. Cloud transaction owner/version guard, explicit local/cloud split, no service credentials.

Release status and HTTPS smoke will be appended after GitHub Actions completes. Live Google authentication/write requires a real account interaction; Console configuration alone is not end-to-end cloud verification.

No independent reviewer: spawn failed due unavailable inherited model. Self-review/audit sources in P0/P1/P2. Physical phones not tested.

## Live Firebase verification

09/11/2026: đăng nhập Google thật qua app local production/subpath thành công với tài khoản chủ project. Lưu default settings480/60/3 bằng transaction thành công; bấm Tải lại dữ liệu đọc được từ cloud, không có lỗi quyền. Không thêm ca làm thử vào sổ thật. Hosted Firestore anonymous REST probe trả403 như mong đợi.

Local final regression cả Chromium/WebKit PASS, gồm cross-tab draft preservation/conflict. CI lần đầu dừng do pin Python Playwright1.65 chưa có trên PyPI; sửa1.62.0 đúng bản đã chạy local và chạy lại, không bỏ E2E gate.

## Release verified

- Code revision03c473f67af253872f5dd755c66acb9214f3ccf1.
- GitHub Actions https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42563854172: verify-build SUCCESS, deploy SUCCESS.
- https://khoatdwork.github.io/WorkingTimeTracking/ HTTP200; toàn bộ suite E2E chạy lại trên HTTPS Chromium/WebKit PASS (dữ liệu giả ở localStorage context riêng, không ghi cloud).
- HTTPS home/settings smoke Chromium/WebKit: không console/page errors, login control/config tải đúng.
- Google login trên hostname Pages thành công bằng tài khoản chủ project, đọc lại default settings từ cùng Firebase ledger đã lưu local. Không tạo ca làm test thật.
- Ảnh output/playwright/P2/hosted-chromium-home.png, hosted-webkit-home.png và settings; ảnh đã xem. Artifacts generated ignored.

P0/P1/P2 hoàn thành phạm vi ứng dụng web cá nhân theo yêu cầu. Source và cấu hình đã push, README/CONTEXT có thật. Không test máy iOS/Android thật, token refresh dài hạn hoặc recovery dữ liệu toàn project. Sổ cần giờ thiết bị đúng; pause ngoài nghỉ trưa, ngày lễ đánh dấu tay. Documentation-only release evidence commit không yêu cầu chạy lại binary giống hệt.
