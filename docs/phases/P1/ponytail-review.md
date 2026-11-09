What this change does: Records work sessions and WFH requests and computes daily, weekly and monthly balances. Manual correction and backups prevent forgotten check-ins from being permanent.

Findings fixed before release:
1. CSV notes starting with a formula could run in a spreadsheet. Prefix formula-looking cells with an apostrophe; regression assertion included.
2. A storage event could remount an editor and lose its draft, or use the new version to overwrite another tab's day. Keep state during refresh and compare the editor's base version before save/delete. Cross-tab browser test added.
3. Cloud load errors prevented sign-out. Show account panel on error so users can recover.
4. Split overview/history/reports/settings from app-shell to keep the reference project's module boundaries. Routes only compose.

Verdict: Ship after final regression recorded in P2.
Not checked: independent reviewer unavailable (model configuration); physical phones.
