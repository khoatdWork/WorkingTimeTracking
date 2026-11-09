# CONTEXT — Lưu sổ thiết bị và Firebase

Implemented P2, 09/11/2026. repository.ts: localStorage key du-gio.tracker.v1, JSON/CSV download. cloud.ts: Firestore users/{uid}/tracker/state, transaction version. use-tracker.ts: auth subscription, loading/error, owner generation guard, navigator.locks cho local writes, storage event cho tab khác.

Sổ thiết bị tách sổ Google; import do người dùng bấm và xác nhận overwrite. Lưu chỉ success sau storage/transaction thành công. Version cũ từ chối ghi, client không tự retry overwrite dữ liệu mới. Cloud không persist offline queue. Lỗi giữ form. Owner đổi invalidate load; không render snapshot owner cũ. Editor giữ baseVersion và bản nháp khi tab khác cập nhật, từ chối lưu đè.

Firestore rules kiểm owner và shape/settings/version; data từng ngày do validateState kiểm khi read/write/import. Mô hình là self-reported personal tracker, không xác thực payroll. Anonymous/A/B và stale version đã test emulator thật (2 cases với nhiều assertions). Unit local storage stale/quota/corrupt và CSV quoting/formula escaping PASS. Browser hai tab kiểm draft conflict, xem P1/P2 test-results.

shortcut: một document/sổ, giới hạn app 850 KB; chuyển document theo tháng khi dữ liệu gần giới hạn hoặc tăng quy mô. Cloud cần mạng. API public config không phải private key.
