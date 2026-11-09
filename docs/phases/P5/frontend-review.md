# P5 frontend review

No new screen or visual system. Reused existing status notice, shadcn Button and account/backup/PWA help. Storage status describes local persistence separately from confirmed Firebase sync. Network failure does not replace the main content with a blocking cloud error.

Policy is visible in backup/account help: local changes upload; a new device pulls Firebase; copies are scoped by account. Import text says both device and Firebase will change. JSON/CSV controls and destructive confirmation remain.

Production regression covers320–1280px and accessibility on the three main screens. Dedicated fixture exercises signed-in320px header/status/retry and verifies no horizontal overflow; screenshots output/playwright/P5. Hosted/physical-device review NOT RUN.
