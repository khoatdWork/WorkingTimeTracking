# P10 — UI source review

Follow-up11/11: leave state is communicated by heading/pill text as well as tint/icon; icon is aria-hidden. Note has a label, pre-wrap and overflow-wrap. Day kind wins over active-session styling. Existing named region, editor, and previous-day warning/stop stay available. Root/agent screenshot review320390 and targeted Today/leave Chromium/WebKit (axe, overflow, reload) PASS. Hosted/Firebase/physical-device limits unchanged.

Ngày 11/11/2026. Source review PASS with no blocker. This record distinguishes source checks from parent browser/visual verification.

Checked native Button triggers with accessible names, unique summary descriptions, Radix aria-expanded/control behavior and decorative chevrons. Closed force-mounted content is display:none, so its controls do not remain in the tab order. Trigger rows retain ample touch targets and visible focus styling. Long summary text can wrap.

Daily controls and previous-day session recovery remain outside collapsed content. Leave/holiday days retain their distinct message and editor action. WFH request status, weekly missing-request/over-limit warnings and separate monthly remaining/balance labels stay visible. Final month summary includes seconds. Opening detail exposes the existing exact totals and controls.

Root fetched fresh https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md today. Source checked native actions, labels/descriptions, focus, hidden content and compact layout against these rules and existing Vietnamese conventions. Expanded state remains in-memory following existing app navigation; URL-backed panels are outside this change.

Final follow-up by root/browser agent: keyboard Enter/Space, accessible regions, axe320390, overflow and bbox width/height/no overlap PASS both engines. Browser agent inspected final Today/Settings/leave screenshots; root observed the current user preview Settings with six sections after the app's safe-update flow. Leave uses Settings draft guards, editor/month return and baseline/error resets; Today retains actual leave status/calendar but no management controls. Visual review caught and fixed an initial selector expecting data-slot=button, which Radix asChild replaces; class-based styling and new bbox checks cover the correction. Hosted P10, real Firebase and physical devices NOT RUN; details test-results.md.
