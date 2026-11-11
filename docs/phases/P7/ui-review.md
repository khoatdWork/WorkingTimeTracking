# P7 UI guideline review

Reviewed changed UI source on 10/11/2026 against freshly fetched https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md and the project's Vietnamese design requirements.

src/modules/tracking/time-off-planner.tsx — connected labels, native date limits, meaningful names and autocomplete off. Buttons use native keyboard activation and existing shadcn focus states. Decorative icons are hidden; icon-only edit/delete actions have date-specific accessible names. Async failures announce an alert and focus it. Confirmed deletion checks version and kind. Notes wrap inside the existing list styles. The list is bounded by the selected calendar month.

src/modules/tracking/overview.tsx — current leave has a named region, visible status, explanatory copy and a retained editor action. Earlier active sessions retain an explicit stop action. Weekly leave markers include P, a visible legend and full accessible labels. No misleading start/WFH actions appear on leave days.

src/modules/tracking/day-editor.tsx — converting existing office sessions to a rest day now uses the existing AlertDialog confirmation instead of silently dropping recorded time. Existing draft and stale-version protection remain.

src/modules/tracking/history.tsx — leave/holiday rows show their note or a clear no-work-required description. Existing numeric and balance display stays based on shared core calculations.

The project deliberately keeps Vietnamese sentence case, fixed Vietnam business dates and in-memory navigation state. Final Chromium/WebKit axe passed on the expanded leave form, saved list and current-leave view;320/390px had no horizontal overflow. Existing production regression retained keyboard navigation and broader viewport checks. Root visually inspected the320px planner and current-rest screenshots. Details belong to test-results.md; no hosted or physical-device result is implied.
