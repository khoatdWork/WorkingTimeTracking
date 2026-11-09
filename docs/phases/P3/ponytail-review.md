What this change does: Adds installation and an offline application shell to the work-time tracker. Local records work offline; Firebase writes still require server acknowledgement.

Self-review at personal-app scale. Read manifest/layout, build/serve/e2e scripts, worker lifecycle/cache matching, PWA hook/panel, shell integration and cloud/local callers. Fixed home link outside trailing-slash scope; stopped serving HTML for non-navigation root requests; retained old assets and prevented other windows from reloading. Failed precache removes its partial version, leaving active release intact.

Looks good within the scope verified in test-results.md. No new dependencies, cloud write queue, notification system or background timer service. Actual elapsed-time calculations still use persisted timestamps.

Not checked: native phone installation, long-session Google popup/token refresh in iOS standalone. An independent agent could not start because the environment's inherited model alias was unavailable; this is self-review, not an independent review.
