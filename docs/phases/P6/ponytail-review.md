What this change does: Settings adds holidays for an inclusive From/To range, including a single day when both dates match. Settings is now the fourth bottom tab after Reports, and the header gear is removed.

Looks good. Ship, subject to the final verification recorded in test-results.md.

Checked final domain, Settings, shell, CSS and connected totals, day editor, repository, sync and rules paths. Assumed one personal ledger bounded at 850 KB. addHolidays validates range endpoints, clones the input, rejects any occupied day and validates the complete result before persistence. A conflict or size failure cannot save a partial range. Dates include both endpoints, weekends and month/year boundaries; only weekdays reduce the shared target.

Deletion retains confirmation, captured version and repository version checks. Each holiday remains an ordinary schema-1 day; JSON/CSV and sync need no migration. The shell uses the existing navigation handler and aria-current for all four native buttons. Removing the header gear leaves one Settings entry.

Read the expanded unit cases and updated Playwright scenario: four-day/two-weekday range, atomic conflict failure with preserved draft, year boundary, navigation order/keyboard, and existing edit/export/import/stale-delete/axe regressions. This review did not execute the final rebuilt suite. test-results.md is authoritative for final checks.

Not checked: hosted P6 deployment, real Firebase sync or physical devices. Earlier single-day screenshots are not proof of final range/navigation layout.
