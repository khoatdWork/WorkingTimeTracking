# P3 frontend review

Plan: preserve Design.md mobile ledger, Be Vietnam Pro and palette (#F4F7FB/#FFFFFF/#152B46/#53657B/#2257C7/#D8E1EC). Add one Settings section and compact status notices, left aligned. Keep the clock as the visual focus; no new marketing layout, animation or full-screen install prompt.

Reviewed against requirement before build: installation belongs with account/storage settings; update asks before reload; offline copy distinguishes the two ledgers. Uses installed shadcn Button/AlertDialog and existing panel/notice styles. Header respects top safe area for standalone, bottom navigation already respects bottom inset. Guide is visible without browser install-event support.

Screenshots inspected at320px with full Settings; no horizontal overflow. Existing screens retain 5-width Chromium/WebKit coverage. Physical safe areas/Home Screen rendering not verified.
