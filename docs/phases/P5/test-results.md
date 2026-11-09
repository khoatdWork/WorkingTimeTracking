# P5 test results — 09/11/2026

- Lint: PASS, không warnings. Typecheck strict: PASS.
- Production build: PASS, root và /WorkingTimeTracking; static export/PWA cache theo scope.
- Unit:33 PASS. Startup guest→uid upload, blank placeholder→cloud pull, remote update, offline reopen/retry, local dirty priority, explicit reset, stale local writes, corruption/quota, edits during pull/upload, account change during read/ack. Cloud API test server-only read/snapshot metadata filters, offline guard, waits transaction ack and rejects version race. Existing exact-second/WFH/core/CSV tests vẫn PASS.
- Firestore Rules emulator:2 PASS, Java21, project demo-working-time. Owner/anonymous/cross-user/version/shape/settings/WFH assertions. Rules/cloud envelope không đổi.
- Dedicated Playwright sync: Chromium/WebKit PASS với hook/repository/sync/app-shell thật và Firebase Auth/transport fixture. Cover startup cloud→local, guest local→cloud, signed-in offline save/page reopen/reconnect, realtime callback pull, rejected write→pending→retry, account isolation. UI320px và retry giữ draft kiểm riêng. Fixture không gọi Firebase production và không được static-export.
- Production Playwright regression: Chromium/WebKit PASS cho exact-second office tracking/reload/pause/resume, WFH8/10/request/legacy/conversion, settings/report/import/export, stale draft/two-tab,5 viewport widths và axe WCAG A/AA. PWA installability/manifest/scope/offline reload/new window/cache privacy/update/failed-install rollback PASS. Lệnh test:e2e chạy đầy đủ cả sync suite.

Hosted Firebase sync P5 / Google sign-in thật sau thay đổi / thiết bị vật lý / deploy: NOT RUN. Không tạo giờ làm giả trong Firebase thật. Screenshots/debug ở output/playwright/P5 (ignored).
