# P5 test results — 09/11/2026

- Lint: PASS, không warnings. Typecheck strict: PASS.
- Production build: PASS, root và /WorkingTimeTracking; static export/PWA cache theo scope.
- Unit:33 PASS. Startup guest→uid upload, blank placeholder→cloud pull, remote update, offline reopen/retry, local dirty priority, explicit reset, stale local writes, corruption/quota, edits during pull/upload, account change during read/ack. Cloud API test server-only read/snapshot metadata filters, offline guard, waits transaction ack and rejects version race. Existing exact-second/WFH/core/CSV tests vẫn PASS.
- Firestore Rules emulator:2 PASS, Java21, project demo-working-time. Owner/anonymous/cross-user/version/shape/settings/WFH assertions. Rules/cloud envelope không đổi.
- Dedicated Playwright sync: Chromium/WebKit PASS với hook/repository/sync/app-shell thật và Firebase Auth/transport fixture. Cover startup cloud→local, guest local→cloud, signed-in offline save/page reopen/reconnect, realtime callback pull, rejected write→pending→retry, account isolation. UI320px và retry giữ draft kiểm riêng. Fixture không gọi Firebase production và không được static-export.
- Production Playwright regression: Chromium/WebKit PASS cho exact-second office tracking/reload/pause/resume, WFH8/10/request/legacy/conversion, settings/report/import/export, stale draft/two-tab,5 viewport widths và axe WCAG A/AA. PWA installability/manifest/scope/offline reload/new window/cache privacy/update/failed-install rollback PASS. Lệnh test:e2e chạy đầy đủ cả sync suite.

Hosted Firebase sync P5 / Google sign-in thật sau thay đổi / thiết bị vật lý: NOT RUN. Không tạo giờ làm giả trong Firebase thật. Screenshots/debug ở output/playwright/P5 (ignored).

## Release evidence

- Source ce5a39a36c17d32f01422d7a49a754b7e1524742, [Actions42571234030](https://github.com/khoatdWork/WorkingTimeTracking/actions/runs/42571234030): verify-build SUCCESS3m17s, deploy SUCCESS10s, completed09/11/2026 13:11 ICT.
- CI: npm ci/lint/typecheck/33unit/2Rules/build/Chromium+WebKit production app/WFH/PWA/sync fixture PASS trên Ubuntu. Fixture/test source không nằm trong static export.
- Hosted [Pages](https://khoatdwork.github.io/WorkingTimeTracking/) full scripts/e2e.mjs PASS: app regression và WFH Chromium/WebKit; Chromium PWA manifest/installability/offline/reopen/ready/cache privacy PASS; WebKit hosted manifest/icons/worker/ready PASS (offline navigation kiểm bằng local server refusal như P3).
- Hosted smoke riêng PASS: help/account copy local-first hiện đúng, bản local tự khởi tạo khi mở app, /tests/e2e/sync-fixture.html trả404. Cache thực tế du-gio-pwa-%2FWorkingTimeTracking%2F-4d43e61fb1621ccd khớp CI build.
- Browser hosted dùng context cô lập chưa đăng nhập, không ghi Firebase production. Kết quả này xác nhận deploy/app/PWA, không thay kiểm sync tài khoản thật.
