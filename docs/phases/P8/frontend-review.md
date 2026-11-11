# P8 frontend review

Reviewed on10/11/2026 with frontend-design, Design.md and the explicit iPhone Settings request. The chosen structure is a grouped list, not an accordion: tapping a row opens one existing panel and Back returns to the list.

Plan before implementation: use the current background#F4F7FB, white groups#FFFFFF, text#152B46/secondary#53657B, primary#2257C7 and border#D8E1EC. Keep Be Vietnam Pro, one column max480px, left text/right chevron. Group account separately, time rules/holidays together, and app/backup together. Rows need names, useful summaries and44px minimum touch targets; implemented76px rows accommodate two lines. No new visual theme or library.

```text
Cài đặt
[ icon  Tài khoản & đồng bộ         > ]

[ icon  Quy tắc giờ làm             > ]
[ icon  Ngày nghỉ lễ                > ]

[ icon  Cài ứng dụng                > ]
[ icon  Bản sao lưu                 > ]
```

The design addresses the user's actual problem: the initial screen fits without scrolling through forms. Hours show the current daily/lunch settings; account and app rows show useful status. Details reuse the established forms and keep save/error/confirmation behavior. The root no longer exposes destructive actions. Repeated panel headings are hidden beneath the detail h1. No ornamental toggles, search box or desktop sidebar was added.

Root inspected Chromium root screenshots at320/390px and the final detail screenshots. Group spacing, wrapping summaries, colored icons and bottom navigation fit narrow viewports. Agent inspected final Hours/Backup320 views; axe checks cover all five subsections in Chromium/WebKit. Existing safe areas, reduced motion and keyboard focus remain. Final check results are in test-results.md; physical devices/hosted P8 visuals NOT RUN.
