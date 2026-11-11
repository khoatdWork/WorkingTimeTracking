# P10 — Frontend review

Follow-up11/11: use a single #E4F3ED panel, #B8D9CE border, #087561 decorative calendar and24px text to make today's leave unmistakable. Keep left alignment, Be Vietnam Pro and existing edit action. Holiday wording stays distinct. Source review found no blocker. Root and browser agent inspected leave320/390 and active-prior-session320 screenshots: heading/note clear, no overflow, recovery visible; targeted Today/leave Chromium/WebKit axe PASS.

Ngày 11/11/2026. Source review và final rendered verification PASS theo bằng chứng cuối bên dưới.

Design plan: preserve Be Vietnam Pro and palette #F4F7FB, #FFFFFF, #152B46, #53657B, #2257C7, #D8E1EC. Keep the single mobile column and daily action hierarchy. Reduce the office clock diameter, use a shorter fixed-hours display for WFH, and group secondary content into summaries with detail on demand. Keep warning text visible with labels rather than relying on color.

The implementation uses existing Button/Badge patterns and a generated shadcn/Radix Collapsible. Grouped rows use borders and shared surface rather than separate shadow cards. Request status belongs inside the daily panel; week/month summaries remain readable when closed. Session tools expand on demand. Following the user's next request, leave planning moves entirely to a sixth Settings row before holidays, reusing the existing panel styling and form.

Parent reported baseline screenshots/heights of roughly 1740–2050px on an 844px viewport. This reviewer did not independently inspect those images or final renders. Parent fetched current web guidelines today; this source review does not claim an independent guideline fetch or visual inspection.

Final follow-up: browser agent xem Today390, six-row Settings root320 và leave390; root xác nhận cửa sổ preview người dùng có hàng Nghỉ phép mới. Hàng nhóm đủ rộng, chữ tóm tắt xuống dòng, WFH status nằm cạnh tên trong clock panel. Office/active office ngắn hơn~47%, WFH~53%; số đo cuối ở test-results.md. Hàng64–94px, bbox không overlap, axe/overflow cả hai engines PASS. Vòng clock vẫn là điểm nhấn văn phòng, WFH dùng số giờ cố định và không có timer giả. Không claim hosted hoặc thiết bị vật lý.
