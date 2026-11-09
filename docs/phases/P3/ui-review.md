# P3 UI review

Guidelines source: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md, fetched09/11/2026.

- src/modules/pwa/pwa-panel.tsx: semantic section/h2, buttons + AlertDialog, descriptive actions, decorative icons hidden, status/error live regions, update confirmation warns about unsaved settings. PASS.
- src/modules/app-shell/tracker-app.tsx: status banners do not reload/dismiss drafts; update shortcut hidden in editor; offline storage wording explicit. PASS.
- src/app/layout.tsx/globals.css: zoom retained, viewport-fit + safe-area top, existing focus/reduced-motion/touch rules retained. PASS.
- Mobile Settings320 screenshot and axe WCAG2A/AA/2.1AA PASS. Native install dialog and actual iOS/Android physical display NOT RUN.
