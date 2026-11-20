# P12 — Kiểm tra giao diện

Đã đọc guidelines hiện hành từ vercel-labs/web-interface-guidelines/main/command.md ngày20/11, rà shell/AccountPanel/BackupHistory. Nút shadcn semantic/focus có sẵn, AlertDialog có title/description/cancel; lỗi async dùng role alert, trạng thái dùng role status, native download chỉ sau click. Dates dùng Intl/toLocaleString với timezoneVN. Giữ route composition và điều hướng local theo brief hiện tại.

Đã xem ảnh WebKit320 mất phiên/conflict/recovery và chạy axe/overflow các màn mới. Copy tài khoản có fallback thay vì hiện undefined khi fixture thiếu email/displayName. Không còn duplicate đoạn conflict. Full app/Today/settings/PWA axe320390 vẫn PASS; có cảnh báo guest nên màn Today cao hơn P10, đây là thay đổi an toàn có chủ đích.

Không kiểm iPhone vật lý, VoiceOver thực hoặc long-session. Sonner transition có thể tạo kết quả contrast trung gian trong WebKit; audit ổn định sau khi toast rời, CSS error color hiện có vẫn giữ. Không tuyên bố hosted UI đã kiểm khi chưa publish.
