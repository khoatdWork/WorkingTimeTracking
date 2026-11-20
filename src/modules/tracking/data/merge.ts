import { validateState, type TrackerState, type WorkDay } from "../core/domain";

function dayValue(day: WorkDay | undefined) {
  return day && JSON.stringify([day.date, day.kind, day.mode, day.request, day.note,
    day.wfhHours ?? null, day.sessions.map(({ start, end }) => [start, end])]);
}
function settingsValue(state: TrackerState) {
  const { dailyMinutes, lunchMinutes, wfhLimit } = state.settings;
  return JSON.stringify([dailyMinutes, lunchMinutes, wfhLimit]);
}
export function sameContent(a: TrackerState, b: TrackerState): boolean {
  return settingsValue(a) === settingsValue(b) &&
    Object.keys(a.days).length === Object.keys(b.days).length &&
    Object.keys(a.days).every(date => dayValue(a.days[date]) === dayValue(b.days[date]));
}

export class SyncConflict extends Error {
  constructor(public readonly remote: TrackerState | null, message: string) {
    super(message);
    this.name = "SyncConflict";
  }
}

// Without a baseline, missing days are additions to preserve, never proof of deletion.
export function mergeStates(local: TrackerState, remote: TrackerState, base?: TrackerState): TrackerState {
  const result = structuredClone(remote), conflicts: string[] = [];
  for (const date of new Set([...Object.keys(local.days), ...Object.keys(remote.days), ...Object.keys(base?.days ?? {})])) {
    const left = local.days[date], right = remote.days[date], before = base?.days[date];
    let chosen: WorkDay | undefined;
    if (dayValue(left) === dayValue(right)) chosen = left;
    else if (base && dayValue(left) === dayValue(before)) chosen = right;
    else if (base && dayValue(right) === dayValue(before)) chosen = left;
    else if (!base && !left) chosen = right;
    else if (!base && !right) chosen = left;
    else { conflicts.push(date); continue; }
    if (chosen) result.days[date] = chosen;
    else delete result.days[date];
  }
  const left = settingsValue(local), right = settingsValue(remote);
  if (left === right || (base && right === settingsValue(base))) result.settings = local.settings;
  else if (!base || left !== settingsValue(base)) conflicts.push("cài đặt giờ làm");
  if (conflicts.length)
    throw new SyncConflict(remote, `Đã dừng đồng bộ để giữ cả hai bản. Nội dung khác nhau: ${conflicts.slice(0, 5).join(", ")}${conflicts.length > 5 ? "…" : ""}. Xuất hai bản để đối chiếu trước khi nhập bản đã kiểm tra.`);
  try { return validateState(result); }
  catch {
    throw new SyncConflict(remote, "Các thay đổi khi ghép tạo ca trùng nhau hoặc dữ liệu không hợp lệ. Đã giữ cả hai bản và dừng đồng bộ để bạn đối chiếu.");
  }
}
