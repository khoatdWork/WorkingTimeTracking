# Release interface review

Guidelines source và skill theo P1/ui-review.md, cùng phiên review09/11/2026. Auth buttons có pending, lỗi có hướng dẫn, icon-only có labels. Error load vẫn cho sign-out. Import/reset/xóa dùng shadcn AlertDialog. Screen clock update không aria-live mỗi giây để tránh đọc liên tục. Inputs không bật autofocus trên mobile, zoom không bị khóa.

Chromium/WebKit axe A/AA ba màn320px PASS. Local static console errors rỗng khi mở home/settings có Firebase. Real Google sign-in/write/read-back PASS; không kiểm khả năng truy cập Google popup bằng screen reader thật.
