# P1 — Kết quả thực

Environment Windows, Node26.4.0/npm11.17.0, Python Playwright, static export tại http://127.0.0.1:3100/WorkingTimeTracking/. Ngày09/11/2026, test clock cố định cùng ngày, data giả trong browser contexts riêng.

- Unit: 16/16 PASS. 6h+10h, missing1second, lunch once, pauses, active reload, VN midnight, weekends/leave/holiday, crossmonth week, leapday, elapsed vs full target, WFH date count, overlap/future/reversed/invalid import, storage stale/quota/corrupt, CSV escaping/formula text.
- Browser Chromium/WebKit PASS: start9h net8h, pause/resume1h net9h, reload persistence, editWFH/sent/approved, add prior day6h, monthtotal15h, settings/export/import/draft confirm.
- Screenshots and overflow assertions at320/360/390/430/1280 PASS. output/playwright/P1 engine-today-width, history, reports. Images visually inspected, not committed (generated).
- axe wcag2a/wcag2aa/wcag21aa, three main screens at320px: PASS after fixing Sonner success colors. No page errors observed.
- Final regression adds cross-tab draft conflict; final status recorded P2.
- Playwright CLI reconnaissance attempted; Chrome channel missing. Real browser verification completed with installed Chromium/WebKit via Python skill, no false CLI PASS.

Not run: physical iOS/Android, Google login inside automated isolated contexts.
