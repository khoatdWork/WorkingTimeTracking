What this change does: Records WFH as an explicit eight or ten net hours. Office tracking stays based on sessions.

Self-review, personal-app load. Read all workedSeconds/startWork callers, editor save/confirmation/version checks, local/cloud persistence, JSON/CSV and rules. Fixed credits do not deduct lunch or create timestamps. Validation blocks mixed/cross-midnight double credit. Existing WFH sessions stay exact; converting requires confirmation; input survives cancellation/errors. New credit never silently appears from selecting WFH mode or planning a future day.

Looks good within the verified scope. No dependencies or parallel calculation path. Existing aggregation callers all use the same core function.

Not checked: actual phone interaction and live cloud WFH write. Other devices must update old PWA code to understand the new field. Independent agent launch failed due unavailable inherited model alias; this is self-review.
