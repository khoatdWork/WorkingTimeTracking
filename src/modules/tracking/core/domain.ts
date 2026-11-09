export type WorkMode = "office" | "wfh";
export type RequestStatus = "none" | "sent" | "approved";
export type DayKind = "work" | "leave" | "holiday";
export interface Session {
  start: number;
  end: number | null;
}
export interface WorkDay {
  date: string;
  mode: WorkMode;
  request: RequestStatus;
  kind: DayKind;
  sessions: Session[];
  note: string;
}
export interface Settings {
  dailyMinutes: number;
  lunchMinutes: number;
  wfhLimit: number;
}
export interface TrackerState {
  schema: 1;
  version: number;
  settings: Settings;
  days: Record<string, WorkDay>;
}
export const DEFAULT_SETTINGS: Settings = {
  dailyMinutes: 480,
  lunchMinutes: 60,
  wfhLimit: 3,
};
export const emptyState = (): TrackerState => ({
  schema: 1,
  version: 0,
  settings: { ...DEFAULT_SETTINGS },
  days: {},
});
const DAY = 86_400_000;
const OFFSET = 7 * 3_600_000;
export function dateKey(time = Date.now()): string {
  return new Date(time + OFFSET).toISOString().slice(0, 10);
}
export function isDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value &&
    value >= "2000-01-01" &&
    value <= "2100-12-31"
  );
}
export function dayStart(date: string): number {
  return Date.parse(`${date}T00:00:00+07:00`);
}
export function addDays(date: string, amount: number): string {
  return dateKey(dayStart(date) + amount * DAY);
}
export function weekday(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}
export function weekStart(date: string): string {
  return addDays(date, -((weekday(date) + 6) % 7));
}
export function monthDates(month: string): string[] {
  const first = `${month}-01`;
  if (!isDate(first)) return [];
  const result: string[] = [];
  for (let d = first; d.slice(0, 7) === month; d = addDays(d, 1))
    result.push(d);
  return result;
}
export function newDay(date: string, mode: WorkMode = "office"): WorkDay {
  return { date, mode, request: "none", kind: "work", sessions: [], note: "" };
}
export function activeSession(
  state: TrackerState,
): { day: WorkDay; session: Session } | null {
  for (const day of Object.values(state.days)) {
    const session = day.sessions.find((s) => s.end === null);
    if (session) return { day, session };
  }
  return null;
}
// Lunch is deducted once per calendar day. Pauses are additional breaks, not lunch.
export function grossSeconds(
  state: TrackerState,
  date: string,
  now: number,
): number {
  const start = dayStart(date),
    end = start + DAY;
  let milliseconds = 0;
  for (const day of Object.values(state.days))
    for (const s of day.sessions) {
      milliseconds += Math.max(
        0,
        Math.min(s.end ?? now, now, end) - Math.max(s.start, start),
      );
    }
  return Math.floor(milliseconds / 1000);
}
export function workedSeconds(
  state: TrackerState,
  date: string,
  now: number,
): number {
  return Math.max(
    0,
    grossSeconds(state, date, now) - state.settings.lunchMinutes * 60,
  );
}
export function targetSeconds(state: TrackerState, date: string): number {
  const kind = state.days[date]?.kind;
  return weekday(date) > 0 &&
    weekday(date) < 6 &&
    kind !== "leave" &&
    kind !== "holiday"
    ? state.settings.dailyMinutes * 60
    : 0;
}
export interface Summary {
  worked: number;
  target: number;
  due: number;
  balance: number;
  remaining: number;
  workdays: number;
  futureDays: number;
  dailyNeeded: number;
}
export function summarize(
  state: TrackerState,
  dates: string[],
  now: number,
): Summary {
  const today = dateKey(now);
  let worked = 0,
    target = 0,
    due = 0,
    workdays = 0,
    futureDays = 0;
  for (const date of dates) {
    const required = targetSeconds(state, date);
    worked += workedSeconds(state, date, now);
    target += required;
    if (required) workdays++;
    if (date <= today) due += required;
    if (date > today && required) futureDays++;
  }
  const remaining = Math.max(0, target - worked);
  return {
    worked,
    target,
    due,
    balance: worked - due,
    remaining,
    workdays,
    futureDays,
    dailyNeeded: futureDays ? Math.ceil(remaining / futureDays) : remaining,
  };
}
export function wfhDays(state: TrackerState, dates: string[]): WorkDay[] {
  return dates
    .map((date) => state.days[date])
    .filter(
      (day): day is WorkDay =>
        !!day && day.mode === "wfh" && day.kind === "work",
    );
}
export function duration(seconds: number, withSeconds = false): string {
  const n = Math.floor(Math.abs(seconds));
  return `${seconds < 0 ? "−" : ""}${String(Math.floor(n / 3600)).padStart(2, "0")}:${String(Math.floor((n % 3600) / 60)).padStart(2, "0")}${withSeconds ? `:${String(n % 60).padStart(2, "0")}` : ""}`;
}
export function readableDuration(seconds: number): string {
  const n = Math.ceil(Math.abs(seconds));
  const h = Math.floor(n / 3600),
    m = Math.floor((n % 3600) / 60),
    s = n % 60;
  return (
    [h ? `${h} giờ` : "", m ? `${m} phút` : "", s ? `${s} giây` : ""]
      .filter(Boolean)
      .join(" ") || "0 phút"
  );
}
export function timeLabel(timestamp: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}
export function dateLabel(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
  },
): string {
  return new Intl.DateTimeFormat("vi-VN", {
    ...options,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(dayStart(date));
}
export function validateState(input: unknown, now = Date.now()): TrackerState {
  if (!input || typeof input !== "object")
    throw new Error("Tệp dữ liệu không hợp lệ.");
  const state = input as TrackerState;
  if (
    state.schema !== 1 ||
    !Number.isSafeInteger(state.version) ||
    state.version < 0 ||
    !state.settings ||
    !state.days ||
    typeof state.days !== "object" ||
    Array.isArray(state.days)
  )
    throw new Error("Cấu trúc dữ liệu không hợp lệ.");
  const { dailyMinutes, lunchMinutes, wfhLimit } = state.settings;
  if (
    !Number.isInteger(dailyMinutes) ||
    dailyMinutes < 1 ||
    dailyMinutes > 1440 ||
    !Number.isInteger(lunchMinutes) ||
    lunchMinutes < 0 ||
    lunchMinutes > 180 ||
    ![2, 3].includes(wfhLimit)
  )
    throw new Error("Cài đặt giờ làm không hợp lệ.");
  const intervals: Session[] = [];
  for (const [date, day] of Object.entries(state.days)) {
    if (
      !isDate(date) ||
      !day ||
      day.date !== date ||
      !["office", "wfh"].includes(day.mode) ||
      !["none", "sent", "approved"].includes(day.request) ||
      !["work", "leave", "holiday"].includes(day.kind) ||
      typeof day.note !== "string" ||
      day.note.length > 1000 ||
      !Array.isArray(day.sessions) ||
      day.sessions.length > 24
    )
      throw new Error("Ngày hoặc nội dung chấm công không hợp lệ.");
    for (const session of day.sessions) {
      if (
        !session ||
        !Number.isSafeInteger(session.start) ||
        dateKey(session.start) !== date ||
        session.start > now ||
        (session.end !== null &&
          (!Number.isSafeInteger(session.end) ||
            session.end <= session.start ||
            session.end > now ||
            session.end - session.start > DAY))
      )
        throw new Error(
          "Giờ làm phải ở quá khứ, giờ về sau giờ vào và ca tối đa 24 giờ.",
        );
      intervals.push(session);
    }
    if (day.kind !== "work" && day.sessions.length)
      throw new Error("Ngày nghỉ không thể chứa ca làm việc.");
  }
  intervals.sort((a, b) => a.start - b.start);
  if (intervals.filter((s) => s.end === null).length > 1)
    throw new Error("Chỉ được có một ca đang chạy.");
  for (let i = 1; i < intervals.length; i++)
    if (intervals[i].start < (intervals[i - 1].end ?? Infinity))
      throw new Error("Các ca làm việc không được trùng giờ.");
  if (new TextEncoder().encode(JSON.stringify(state)).length > 850_000)
    throw new Error(
      "Sổ đã gần đầy. Hãy xuất bản sao lưu và lưu trữ các năm cũ trước khi thêm dữ liệu.",
    );
  return state;
}
export function startWork(
  state: TrackerState,
  mode: WorkMode,
  now: number,
): TrackerState {
  if (activeSession(state)) throw new Error("Hãy kết thúc ca đang chạy trước.");
  const next = structuredClone(state),
    date = dateKey(now);
  const day = next.days[date] ?? newDay(date, mode);
  day.kind = "work";
  day.mode = mode;
  day.sessions.push({ start: Math.floor(now / 1000) * 1000, end: null });
  next.days[date] = day;
  return validateState(next, now);
}
export function stopWork(state: TrackerState, now: number): TrackerState {
  const next = structuredClone(state),
    active = activeSession(next);
  if (!active) throw new Error("Chưa có ca làm việc đang chạy.");
  if (now <= active.session.start)
    throw new Error("Ca vừa bắt đầu. Hãy thử lại sau một giây.");
  active.session.end = Math.floor(now / 1000) * 1000;
  return validateState(next, now);
}
