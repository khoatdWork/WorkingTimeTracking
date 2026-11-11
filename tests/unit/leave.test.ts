import { describe, expect, it } from "vitest";
import {
  addDays,
  addTimeOff,
  dayStart,
  emptyState,
  monthDates,
  newDay,
  removeTimeOff,
  summarize,
  validateState,
} from "@/modules/tracking/core/domain";
import { exportCsv } from "@/modules/tracking/data/repository";

const now = dayStart("2026-11-10");
const tomorrow = "2026-11-11";

describe("planned leave", () => {
  it("marks tomorrow off without adding hours and restores the target after removal", () => {
    const original = emptyState();
    const next = addTimeOff(original, "leave", tomorrow, tomorrow, "Việc riêng", now);
    expect(next.days[tomorrow]).toEqual({ ...newDay(tomorrow), kind: "leave", note: "Việc riêng" });
    const week = Array.from({ length: 7 }, (_, index) => addDays("2026-11-09", index));
    expect(summarize(next, week, now)).toMatchObject({ target: 4 * 8 * 3600, worked: 0, futureDays: 2 });
    expect(summarize(next, monthDates("2026-11"), now).target)
      .toBe(summarize(original, monthDates("2026-11"), now).target - 8 * 3600);
    expect(removeTimeOff(next, "leave", tomorrow, now)).toEqual(original);
    expect(original.days).toEqual({});
  });

  it("adds inclusive leave ranges without deducting weekends twice", () => {
    const next = addTimeOff(emptyState(), "leave", "2026-11-13", "2026-11-16", "", now);
    expect(Object.keys(next.days)).toEqual(["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"]);
    expect(summarize(next, monthDates("2026-11"), now).target).toBe(19 * 8 * 3600);
    const weekend = addTimeOff(emptyState(), "leave", "2026-11-14", "2026-11-15", "", now);
    expect(summarize(weekend, monthDates("2026-11"), now).target).toBe(21 * 8 * 3600);
  });

  it("rejects the whole range if any date already has work, a plan, leave or a holiday", () => {
    for (const record of [
      { ...newDay(tomorrow), sessions: [{ start: dayStart(tomorrow), end: dayStart(tomorrow) + 3600000 }] },
      { ...newDay(tomorrow, "wfh"), request: "sent" as const },
      { ...newDay(tomorrow), kind: "leave" as const },
      { ...newDay(tomorrow), kind: "holiday" as const },
    ]) {
      const state = emptyState();
      state.days[tomorrow] = record;
      const before = structuredClone(state);
      expect(() => addTimeOff(state, "leave", "2026-11-10", "2026-11-12", "", now))
        .toThrow("đã có dữ liệu");
      expect(state).toEqual(before);
    }
    const holiday = addTimeOff(emptyState(), "holiday", tomorrow, tomorrow, "", now);
    expect(() => removeTimeOff(holiday, "leave", tomorrow, now)).toThrow("không còn là ngày nghỉ phép");
    expect(holiday.days[tomorrow].kind).toBe("holiday");
  });

  it("validates leave dates and notes and retains leave in existing JSON and CSV formats", () => {
    expect(() => addTimeOff(emptyState(), "leave", "2026-02-30", tomorrow, "", now))
      .toThrow("Khoảng ngày nghỉ phép không hợp lệ");
    expect(() => addTimeOff(emptyState(), "leave", tomorrow, "2026-11-10", "", now)).toThrow("không hợp lệ");
    expect(() => addTimeOff(emptyState(), "leave", tomorrow, tomorrow, "a".repeat(1001), now)).toThrow("không hợp lệ");
    const state = addTimeOff(emptyState(), "leave", tomorrow, tomorrow, "Việc riêng", now);
    expect(validateState(JSON.parse(JSON.stringify(state)), now)).toEqual(state);
    expect(exportCsv(state, now)).toContain('"2026-11-11","Văn phòng","none","leave","","","","Việc riêng"');
  });
});
