What this change does: It saves work to the device first and syncs Firebase on startup, login, reconnect and remote changes. Pending data survives reopening the app, and server errors leave the local copy usable.

Looks good. Ship within the verified local/emulator scope.

Checked the callers in the app shell/editor/account/PWA, local and cloud persistence, auth guards, transaction versions and test fixtures. Fixed response races so an upload cannot clear newer edits, a retry cannot discard the editor draft, and an old account response cannot replace the active ledger. No remaining actionable findings in this change.

Policy: pending local data replaces the full server ledger, as requested. Clean local data pulls remote updates. This is a personal ledger, one document per user; it does not merge concurrent edits by day.

Not checked: real-account/hosted Firebase sync for P5, physical devices. Browser Firebase transport/auth are fixtures.
