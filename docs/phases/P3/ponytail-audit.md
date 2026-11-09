What this repo does: Personal work-time ledger with separate local and owner-only Firebase storage. Assumed one person and a small number of devices/tabs.

Scoped follow-up audit: build/deploy/manifest/worker registration and caching; auth/storage boundaries, transaction acknowledgement, drafts and update reload. Public build-only cache allowlist excludes Auth, Firestore and other Pages applications. Cache prefix includes scope; update retains old build assets while windows may need them. No background writes or fake sync status added.

No unresolved new data-loss or privacy finding within this change. Existing one-document size cap and local backup requirement remain documented in README/data CONTEXT. Old caches can persist until an activation with no clients; this is intentional protection for old tabs, documented as a shortcut.

Not checked: a new whole-repo audit of unchanged calculation code, physical hardware and long-lived auth sessions. Self-audit; independent agent unavailable.
