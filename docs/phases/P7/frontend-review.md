# P7 frontend review

Reviewed the leave feature against the user request, Design.md and frontend-design on 10/11/2026. The existing palette, Be Vietnam Pro, 480 px shell and left-aligned ledger layout are retained. Plan: clock first, a compact leave section with a clear add action second, existing weekly/monthly totals below. The form expands only when requested; its stacked date fields reuse the holiday layout and native inputs.

The feature uses the app's existing vocabulary: Nghỉ phép, Từ ngày, Đến ngày, Lưu ngày nghỉ phép. It defaults to tomorrow and explains a same-day range. Empty state gives the next action. Saved days are a monthly list with dates and notes, no extra cards or decoration. Leave and holidays reuse the same component, while their headings and actions stay specific.

On a leave day, a direct status replaces the clock and office/WFH actions. Users can edit the day to return it to work. A previous running session can still be stopped. The weekly P marker has a text legend and an accessible description; color is not the only signal.

Destructive conversion from recorded work requires confirmation. Occupied ranges direct users to the existing editor; errors retain the entered dates and note. A separate confirmed delete explains that weekday targets return. No new navigation item or dependency is needed.

Root inspected output/playwright/P7/chromium-leave-form-320.png, chromium-leave-panel-320.png and chromium-today-leave-320.png. The stacked form, actions, visible rest status and weekly P legend fit320px without clipped content. Existing fixed navigation/skip links can appear mid-page in stitched full-page screenshots; the cropped planner confirms readable form controls. Chromium/WebKit axe and320/390 layout checks passed for the form/list/rest view, with broader existing screen regression at320/360/390/430/1280px. Final browser evidence is recorded in test-results.md. Physical devices and hosted P7 UI were not inspected.
