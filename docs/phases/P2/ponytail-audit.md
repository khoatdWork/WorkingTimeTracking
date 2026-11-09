What this repo does: A Vietnamese personal time tracker backed by Firebase and served as static files by GitHub Pages. Assumed a single person per Firebase account and occasional multi-tab/device use.

Audited entry route, shell, all business modules, Firebase config/Rules, localStorage/import/export, tests and Actions. No unresolved must-fix at personal scale. Double submits guarded, versions reject retries/stale devices, cross-tab editor preserves draft. Auth changes discard old owner views. JSON import validated and overwrite confirmed. CSV formula injection neutralized. Dependency production audit clean after grpc override.

Verdict: healthy within documented limits, release verification in test-results.
Not checked: Google provider real refresh cycle, real mobile hardware, independent audit. Dev tooling transitive advisories remain documented in P0; no claim of full dependency audit clean.

Release verified03c473f: full CI and hosted browser flows PASS, real Google sign-in and cloud default settings read/write PASS. No additional unresolved must-fix findings from release verification. Docs-only evidence update leaves tested application source unchanged.
