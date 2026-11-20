What this change does: It keeps the account ledger when Google authentication disappears. It merges independent edits, stops conflicting writes, and preserves the previous cloud state in an immutable history document before replacement.

Reviewed the repository, sync, cloud transaction, auth observer, account panel, import/reset dialogs, history UI, Firestore Rules and their callers. Load assumed: one personal ledger with several browser/PWA sessions.

Fixed during review: an edit during initial pull must be rebased before recording the new baseline; cloudVersion without the old contents cannot authorize deletion; imports must bind consent to owner/version; Radix Action must not close a failed import dialog; conflict consent must be invalidated when the remote snapshot changes; old auth callbacks must not set the new session's sync status. Regression tests cover these cases.

No remaining must-fix finding in the checked scope. Core math and schema stay unchanged. History creation and state replacement are checked in one transaction and enforced by emulator-tested Rules; acknowledgement cannot clear newer edits.

Verdict: Ready for coordinated release of app and Rules after approval. This is not a hosted-verification verdict.
Not checked: real iPhone persistence/long-session, live P12 Firebase writes, project-admin actions outside client Rules. Independent agent review unavailable because inherited model was rejected by the tool.
