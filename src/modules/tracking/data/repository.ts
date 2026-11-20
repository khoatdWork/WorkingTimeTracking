import { emptyState, validateState, type TrackerState } from "../core/domain";
import { sameContent } from "./merge";
export const LOCAL_KEY = "du-gio.tracker.v1";
export const ACCOUNT_KEY = "du-gio.account.v1";
const CLAIM_KEY = "du-gio.guest-claim.v1";
export interface SavedAccount { uid: string; label: string }
export interface LocalRevision { at: number; state: TrackerState }
export interface LocalBackup {
  state: TrackerState;
  cloudVersion: number | null;
  dirty: boolean;
  base?: TrackerState;
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
  const base = parsed.base === undefined ? undefined : validateState(parsed.base);
  if (base && base.version !== parsed.cloudVersion)
    throw new Error("Mốc đồng bộ của bản sao lưu không hợp lệ. Dữ liệu được giữ nguyên để kiểm tra.");
  return { ...parsed, state: validateState(parsed.state), base };
}
export function readAccount(): SavedAccount | null {
  const value = localStorage.getItem(ACCOUNT_KEY);
  if (value === null) {
    const uids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${LOCAL_KEY}:`) && !key.endsWith(".history")) uids.push(key.slice(LOCAL_KEY.length + 1));
    }
    if (uids.length > 1) throw new Error("Thiết bị đã có nhiều sổ tài khoản. Hãy đăng nhập đúng Google để mở sổ; chưa chuyển sang sổ khách.");
    return uids.length ? { uid: uids[0], label: "tài khoản Google đã dùng" } : null;
  }
  const account = JSON.parse(value);
  if (account === null) return null;
  if (!account || typeof account.uid !== "string" || !account.uid || typeof account.label !== "string")
    throw new Error("Không đọc được tài khoản đã dùng. Chưa chuyển sang sổ khác để tránh nhầm dữ liệu.");
  return account;
}
export function rememberAccount(account: SavedAccount | null) {
  if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  else localStorage.setItem(ACCOUNT_KEY, "null");
}
export function readRevisions(uid: string | null): LocalRevision[] {
  const value = localStorage.getItem(`${localKey(uid)}.history`);
  if (!value) return [];
  const revisions = JSON.parse(value);
  if (!Array.isArray(revisions)) throw new Error("Không đọc được lịch sử sao lưu trên thiết bị.");
  return revisions.map(revision => {
    if (!Number.isSafeInteger(revision.at)) throw new Error("Thời điểm bản sao lưu không hợp lệ.");
    return { at: revision.at, state: validateState(revision.state) };
  });
}
export function preserveRevision(uid: string | null, state: TrackerState) {
  const revisions = readRevisions(uid);
  if (revisions[0] && sameContent(revisions[0].state, state)) return;
  revisions.unshift({ at: Date.now(), state });
  revisions.splice(10);
  while (revisions.length > 1 && new TextEncoder().encode(JSON.stringify(revisions)).length > 1_000_000)
    revisions.pop();
  try { localStorage.setItem(`${localKey(uid)}.history`, JSON.stringify(revisions)); }
  catch { throw new Error("Không lưu được bản phục hồi trên thiết bị. Chưa thay sổ; hãy xuất JSON và giải phóng bộ nhớ trước khi thử lại."); }
}
export function readLocal(uid: string | null = null): TrackerState {
  return readBackup(uid)?.state ?? emptyState();
}
export function storeBackup(uid: string | null, backup: LocalBackup): void {
  validateState(backup.state);
  try {
    const key = localKey(uid), value = JSON.stringify(uid ? backup : backup.state);
    const previous = readBackup(uid);
    if (previous && !sameContent(previous.state, backup.state)) preserveRevision(uid, previous.state);
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
  const claimed = localStorage.getItem(CLAIM_KEY);
  const guest = uid && (!claimed || claimed === uid) ? readBackup(null) : null;
  const backup: LocalBackup = guest &&
    (guest.state.version > 0 || Object.keys(guest.state.days).length > 0)
    ? guest
    : { state: emptyState(), cloudVersion: null, dirty: false };
  // Retain the original guest copy; only the first account may claim it.
  if (uid && guest === backup) {
    try { localStorage.setItem(CLAIM_KEY, uid); }
    catch { throw new Error("Không lưu được tài khoản nhận dữ liệu. Bản khách vẫn được giữ nguyên."); }
  }
  storeBackup(uid, backup);
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
  storeBackup(uid, { ...backup, state: saved, cloudVersion: backup?.cloudVersion ?? null, dirty: true });
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
