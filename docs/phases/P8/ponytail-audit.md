What this repo does: This personal app records office and fixed WFH hours, balances monthly targets and keeps a local ledger that can sync to Firebase. Assumed load is one person and the existing 850 KB ledger cap.

Healthy. Nothing to fix in the reviewed final P8 scope.

This is a scoped audit of Settings navigation and affected draft/persistence paths, not a fresh whole-repository audit. Read project instructions, design, plan, relevant module contexts, README/build/deploy configuration, menu/shell/form/planner sources and connected repository, account and PWA behavior.

Traced grouped list selection through subsection state, dirty-draft confirmation, local save and return navigation. Existing panels continue to own their business actions. The shell keeps holiday month/subsection state across DayEditor, blocks navigation during persistence and clears its dirty flag when a move is accepted. Cancelled navigation retains the current form. The update banner routes through the same guard into Cài ứng dụng, whose existing update confirmation still controls reload.

Checked stale hour-rule protection against both incoming settings and repository versions. Drafts survive unrelated ledger updates, failed saves and cancelled navigation. Successful saves reset form baselines. Pending-save controls are disabled to avoid losing edits made after submission. Existing holiday collision/deletion checks, backup import/reset confirmations, account isolation and Firebase acknowledgement behavior remain in their established paths.

The menu has five fixed rows in three groups. It reuses shadcn buttons and existing panels without adding dependencies, routes, schemas or another persistence layer. No new scale, security, performance or unnecessary-abstraction issue was found for the stated personal use.

Not checked: unrelated modules in full, fresh dependency/security scan, independent final suite/emulator execution, hosted deployment, real Firebase authentication/sync or physical devices. Final verification belongs to test-results.md.
