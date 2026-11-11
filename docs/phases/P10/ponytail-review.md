What this change does: Today prioritizes daily tracking and places secondary information behind compact summaries. Weekly/monthly calculations, request controls and session details remain available through shadcn/Radix disclosures. Leave planning moves into Settings → Nghỉ phép.

Follow-up source review11/11: prominent leave/holiday panel keeps the existing kind branch and actions, adds a decorative calendar icon and readable24px heading/note. Pill selects the day kind before an active prior-day session. No actionable findings; no new calculation, persistence or schema. Reviewer checked source only; root/agent browser results are recorded in test-results.md.

Looks good. Ship, subject to final verification in test-results.md.

Reviewed overview.tsx, shell state, CSS and the generated Collapsible primitive with connected planner/domain behavior. Assumed one personal ledger. Daily start/pause/stop and WFH hour actions retain their existing callbacks. A prior-day active session keeps its visible warning and stop actions outside collapsed sections, including on leave/holiday days. Legacy WFH sessions keep their existing preservation notice and edit path.

Weekly summaries retain request and over-limit warnings. Monthly remaining and balance have distinct labels; the final summary includes seconds. Request status stays visible without expanding its controls. Expanded state lives in the shell and survives DayEditor; closed content is display:none. Leave management uses the existing Settings dirty guard and retains subsection/month through DayEditor. New form baseline resets to current tomorrow; Hủy clears errors, failed saves keep input. Today no longer mounts the planner or its month/save props.

Each disclosure uses a button, Radix expanded/control semantics, a unique useId description and a decorative chevron. No new business calculation, schema or sync behavior is added. No actionable source blocker was found.

Not checked: independent final tests, rendered mobile layout, assistive-technology interaction, hosted deployment, real Firebase sync or physical devices. Parent verification is recorded separately in test-results.md.
