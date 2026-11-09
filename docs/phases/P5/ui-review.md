# P5 UI review

- Existing shadcn controls and layout retained; labels distinguish local save/pending/syncing/server-confirmed states.
- Sync status uses role=status and text, not color alone. Error keeps local content and offers retry.
- Retry during a day edit keeps the unsaved note. Local save/quota errors still propagate to the editor instead of reporting success.
-320px signed-in header has no horizontal overflow in Chromium/WebKit fixture; production5-width/axe regression passes.
- Import/reset still require AlertDialog; copy explains automatic upload after local change.

No new design/accessibility issue found in changed paths. Actual Firebase session and native phone/PWA installation for P5 NOT RUN.
