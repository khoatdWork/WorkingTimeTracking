import { emptyState, validateState, type TrackerState } from "../core/domain";
export const LOCAL_KEY = "du-gio.tracker.v1";
export interface LocalBackup {
  state: TrackerState;
  cloudVersion: number | null;
  dirty: boolean;
}
export const localKey = (uid: string | null = null) =>
  uid ? `${LOCAL_KEY}:${uid}` : LOCAL_KEY;
export function readBackup(uid: string | null): LocalBackup | null {
  const data = localStorage.getItem(localKey(uid));
  if (!data) return null;
  const parsed = JSON.parse(data);
  if (!uid)
    return { state: validateState(parsed), cloudVersion: null, dirty: true };
  if (typeof parsed.dirty !== "boolean" ||
      (parsed.cloudVersion !== null &&
        (!Number.isSafeInteger(parsed.cloudVersion) || parsed.cloudVersion < 0)))
    throw new Error("Bản sao lưu đồng bộ không hợp lệ.");
  return { ...parsed, state: validateState(parsed.state) };
}
export function readLocal(uid: string | null = null): TrackerState {
  return readBackup(uid)?.state ?? emptyState();
}
export function storeBackup(uid: string | null, backup: LocalBackup): void {
  validateState(backup.state);
  try {
    const key = localKey(uid), value = JSON.stringify(uid ? backup : backup.state);
    if (localStorage.getItem(key) !== value) localStorage.setItem(key, value);
  } catch {
    throw new Error(
      "Không lưu được trên thiết bị. Hãy giải phóng bộ nhớ trình duyệt và xuất bản sao lưu trước khi thử lại.",
    );
  }
}
export function openLocal(uid: string | null): LocalBackup {
  const existing = readBackup(uid);
  if (existing) return existing;
  const guest = uid ? readBackup(null) : null;
  const backup: LocalBackup = guest &&
    (guest.state.version > 0 || Object.keys(guest.state.days).length > 0)
    ? guest
    : { state: emptyState(), cloudVersion: null, dirty: false };
  storeBackup(uid, backup);
  // Claim guest data once so a later Google account cannot upload it.
  if (uid && guest === backup) localStorage.removeItem(LOCAL_KEY);
  return backup;
}
export async function withLocalLock<T>(operation: () => T | Promise<T>): Promise<T> {
  return globalThis.navigator?.locks
    ? navigator.locks.request("du-gio-save", operation)
    : operation();
}
export function writeLocal(
  next: TrackerState,
  expectedVersion: number,
  uid: string | null = null,
): TrackerState {
  const backup = readBackup(uid);
  const current = backup?.state ?? emptyState();
  if (current.version !== expectedVersion)
    throw new Error("Dữ liệu đã đổi ở tab khác. Hãy tải lại trước khi lưu.");
  const saved = validateState({ ...next, version: expectedVersion + 1 });
  storeBackup(uid, { state: saved, cloudVersion: backup?.cloudVersion ?? null, dirty: true });
  return saved;
}
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCsv(state: TrackerState, now: number): string {
  const quote = (s: string) =>
    `"${(/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""')}"`;
  return (
    "\uFEFF" +
    [
      "Ngày,Nơi làm,Request,Loại ngày,Giờ vào,Giờ về,Giờ WFH đã ghi nhận,Ghi chú",
      ...Object.values(state.days)
        .sort((a, b) => a.date.localeCompare(b.date))
        .flatMap((d) => {
          const rows = d.sessions.length ? d.sessions : [{ start: 0, end: 0 }];
          return rows.map((s) =>
            [
              d.date,
              d.mode === "office" ? "Văn phòng" : "WFH",
              d.request,
              d.kind,
              s.start ? new Date(s.start).toISOString() : "",
              s.start
                ? s.end
                  ? new Date(s.end).toISOString()
                  : `Đang chạy ${new Date(now).toISOString()}`
                : "",
              d.wfhHours === undefined ? "" : String(d.wfhHours),
              d.note,
            ]
              .map(quote)
              .join(","),
          );
        }),
    ].join("\r\n")
  );
}
