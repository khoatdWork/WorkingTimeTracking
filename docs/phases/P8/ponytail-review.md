What this change does: Settings becomes a compact grouped list. Selecting a row opens its existing panel with a Back action, while unsaved hour-rule and holiday drafts require a choice before leaving.

Looks good. Ship, subject to the final verification in test-results.md.

Reviewed the new settings menu, shell navigation, hour-rule form, holiday planner and connected local persistence, account and PWA paths. Expected load is one personal ledger bounded by the existing 850 KB limit. Settings subsections use local screen state, consistent with the existing four tabs; no router, schema or storage migration is introduced.

Back, bottom tabs, holiday editing and the update notice all pass through requestMove. It refuses moves during a local save and asks before discarding a reported dirty draft. Cancelling that dialog leaves the mounted fields intact; accepting clears dirty state and performs the captured move. Holiday editor return retains the subsection and month. Update notices open the app subsection directly and remain available from other Settings views; DayEditor still hides the notice.

The hour-rule form captures its settings baseline on the first change and keeps editable strings separate from incoming settings. It follows incoming settings while pristine, retains drafts on save failure, and rejects saves when the current settings differ from the captured baseline. Unrelated day updates no longer remount it through a state.version key. Holiday save resets its draft baseline only after persistence, and both forms protect browser unload while dirty.

One issue found during review was fixed: hour-rule inputs and WFH buttons stayed editable during a pending save, so a late edit could disappear when save success cleared the draft. The final form disables these controls while busy. Its decorative clock is hidden from assistive technology and numeric inputs disable autocomplete.

Read browser scenario source for list/subsection navigation, draft cancellation/discard, stale settings, holiday editor return, backup and mobile accessibility. This is a source review; final test execution belongs to test-results.md.

Not checked: independent final lint/typecheck/build, browser/emulator execution, hosted deployment, real Firebase authentication/sync or physical devices.
