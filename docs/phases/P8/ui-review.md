# P8 UI guideline review

Reviewed10/11/2026 against freshly fetched https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md and the project's Vietnamese/mobile conventions.

src/modules/settings/settings-menu.tsx — semantic lists/native shadcn buttons, explicit names/described summaries, decorative icons hidden,76px row targets, inset focus outline visible inside the rounded group. Long account labels/summaries wrap. Five rows need no virtualization. Vietnamese sentence case and existing fixed-date conventions retained.

src/modules/app-shell/tracker-app.tsx — each submenu has an h1, explicit Back action, four-tab navigation and focus after view changes. Only the selected panel mounts. All departure paths share the dirty guard and persist-busy guard. PWA notices open the correct detail screen through the same guard. Existing destructive confirmations/import validation remain.

src/modules/settings/settings-form.tsx — labels/names/number bounds remain; autocomplete off and controls disabled during save. Beforeunload and shell dirty reporting protect drafts. Pristine incoming state is current; dirty input is retained on external settings change or save error. Baseline comparison stops stale overwrites.

src/modules/tracking/time-off-planner.tsx — optional guard integration reports changes relative to the last successful submit; failed ranges retain dates/note and successful persistence rebases them. Existing accessible validation, kind/version checks and delete dialog retained.

Final Chromium/WebKit axe WCAG A/AA and overflow checks pass for list/all five subsections at320/390. Root/agent visually inspected screenshots. In-memory navigation follows the existing app convention; URL-backed subsection navigation was not introduced. Hosted and physical-device checks NOT RUN.
