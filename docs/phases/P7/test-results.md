# P7 verification — 10/11/2026

Final production build served locally at `/` for regression and `/scope/` for the isolated leave suite, with fake ledger data in isolated browser contexts. No test data was written to a real Firebase account. P7 is not deployed.

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; static export and PWA cache `du-gio-pwa-%2F-7bfc73bf7f0ebfa7` |
| `npm run test:unit` | PASS, 44 tests across 6 files |
| `npm run test:db` | PASS, 2 Firestore rules tests on demo emulator with Java21 |
| Production app suite, Chromium/WebKit | PASS |
| WFH regression, Chromium/WebKit | PASS |
| Holiday regression, Chromium/WebKit | PASS |
| New leave suite, Chromium/WebKit | PASS |
| PWA offline/installability/update suite | PASS, Chromium/WebKit; explicit update/cancel/failed-install rollback |
| `npm run test:sync` | PASS, Chromium/WebKit with isolated Auth/transport fixture |
| Hosted P7 smoke / real-account Firebase sync | NOT RUN |
| Physical phones / installed physical PWA | NOT RUN |

Core leave cases cover tomorrow, inclusive ranges, weekday week/month targets, weekends, conflict rejection without mutation, removal/restored targets, current-kind protection, invalid dates/notes and existing JSON/CSV compatibility. Existing holiday tests use the same generalized core helpers; boundary/leap/year/storage-cap coverage remains.

The new browser suite verifies tomorrow defaults and reload persistence, future entries in History, ranges through weekends/month boundaries, atomic rejection of occupied dates and retained draft, edit notes/kind and target updates, JSON export/import, stale deletion across tabs, cancellation and confirmed removal. It checks that converting saved office sessions to leave requires confirmation and preserves them on cancel. Current leave replaces office/WFH clock controls with the leave region and retains edit access. Opening the untouched form after midnight defaults to the new tomorrow. Axe WCAG A/AA covers expanded form, saved list and current-leave view; widths320/390 fit without horizontal overflow. No browser page errors were observed in the leave contexts.

Regression app tests cover clock, pause/reload, manual entry, reports, backup and draft across320/360/390/430/1280px. WFH tests retain fixed8/10 hours, legacy sessions and explicit conversion. Holiday tests retain inclusive ranges/year boundary, targets, four-tab keyboard navigation, stale writes, import/export and hovered-button axe. The intentional day-off UI required updating the old WFH test's expectation of a zero timer to the named holiday panel, while retaining assertions that fixed hours were removed.

Execution notes: initial rules command could not find Java on PATH; reran successfully with ignored local `.private/jre/jdk-21.0.13+9-jre`. Initial default port3100 was occupied by a different app, so reran production app/WFH/holiday tests at3127. The sequential runner reached new leave tests, where immediate storage assertions exposed test timing races; those now wait for persisted UI transitions. The final leave suite passed separately at `http://127.0.0.1:3137/scope/` using the same production build. PWA ran at3138 with the existing server helper; sync ran through the existing Vite fixture at3101. The entire combined command was not rerun after all test-only fixes; each constituent suite passed against the unchanged final app source.

Reproduction:

```powershell
$env:E2E_PORT='3127'
npm run test:e2e
```

Screenshots and backups are ignored under `output/playwright/P7/`: both engines' leave form, leave list at320/390, and today's leave view. Root inspected the Chromium full-page form, cropped planner and current-rest screenshots; existing fixed navigation/skip-link can appear mid-page in a stitched full-page capture. Final visual review is described in frontend-review.md. Native date presentation follows browser locale, while saved dates use YYYY-MM-DD and business dates use Vietnam UTC+7.

These results verify local persistence and fixture behavior. They do not establish P7 hosted deployment, live account synchronization or physical-device behavior.
