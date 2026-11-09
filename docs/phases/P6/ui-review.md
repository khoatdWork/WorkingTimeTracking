# P6 UI guideline review

Reviewed final P6 range/navigation source on 09/11/2026 against https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md, freshly fetched during this review, and project Vietnamese design requirements.

## src/modules/settings/holiday-settings.tsx

Pass on reviewed code. From/To and optional-name inputs have connected labels, meaningful names, native date bounds, autoComplete off and disabled busy states. Copy explains inclusive range endpoints. Invalid ranges preserve both dates and name, announce an alert and focus the summary. All writes go through the existing persistence callback. Native buttons provide keyboard activation, named icon actions, and destructive confirmation. Decorative icons are hidden from assistive technology. The monthly list uses Intl dates, time elements and wrapping names.

## src/modules/app-shell/tracker-app.tsx

Pass on reviewed code. Bottom tabs are Hôm nay, Lịch sử, Báo cáo, Cài đặt in that order. One Settings button replaces the header gear; all tabs use aria-current and native keyboard behavior. Navigation retains existing scroll handling. Four-column CSS uses minmax(0, 1fr), existing 44 px targets and bottom safe areas.

## src/components/ui/button.tsx

Pass on reviewed code. Earlier browser axe found insufficient contrast for the enabled hovered primary CTA; shared hover opacity changed from 80% to 90%. The final suite retains the hover-state axe check.

The project deliberately uses Vietnamese sentence case, Vietnam business time and documented in-memory view/filter state. Monthly lists are bounded by calendar days and need no virtualization. Root subsequently ran the final rebuilt Chromium/WebKit suite: range writes, four-tab keyboard navigation,320px layout and hovered-button axe passed; evidence is in test-results.md.
