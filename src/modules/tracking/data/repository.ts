import { emptyState, validateState, type TrackerState } from "../core/domain";
export const LOCAL_KEY = "du-gio.tracker.v1";
export function readLocal(): TrackerState {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? validateState(JSON.parse(data)) : emptyState();
}
export function writeLocal(
  next: TrackerState,
  expectedVersion: number,
): TrackerState {
  const current = readLocal();
  if (current.version !== expectedVersion)
    throw new Error("Dữ liệu đã đổi ở tab khác. Hãy tải lại trước khi lưu.");
  const saved = validateState({ ...next, version: expectedVersion + 1 });
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saved));
  } catch {
    throw new Error(
      "Không lưu được trên thiết bị. Hãy giải phóng bộ nhớ trình duyệt và xuất bản sao lưu trước khi thử lại.",
    );
  }
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
