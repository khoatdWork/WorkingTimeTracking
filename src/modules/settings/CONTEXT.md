# CONTEXT — Cài đặt giờ làm

Implemented P1, 09/11/2026. settings-form.tsx với shadcn Input/Label/Button. Daily hours chuyển thành dailyMinutes integer, nghỉ 0..180 phút, WFH 2 hoặc3. Default480/60/3 theo user. Cấu hình thay đổi tính lại toàn lịch sử và có notice trước lưu.

Save dùng app-shell run + tracking data transaction, không báo success sớm. Browser đã kiểm đổi nghỉ60→30, WFH3→2, export JSON và restore60. Native numeric bounds + core validator khi persistence. Chưa có config hiệu lực theo ngày vì user chưa yêu cầu.

P4: help nghỉ trưa nói rõ chỉ áp dụng ngày theo ca; fixed WFH8/10 giờ là giờ ròng và không bị trừ. Cài dailyMinutes vẫn quyết định chỉ tiêu, wfhLimit vẫn đếm số ngày WFH.
