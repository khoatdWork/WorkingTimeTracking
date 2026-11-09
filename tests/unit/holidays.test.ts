import { describe, expect, it } from "vitest";
import {
  addHolidays,
  dayStart,
  emptyState,
  monthDates,
  newDay,
  removeHoliday,
  summarize,
} from "@/modules/tracking/core/domain";

const now = dayStart("2026-11-09");
const date = "2026-11-16";

describe("dedicated holiday management", () => {
  it("allows future holidays and removes one weekday from week and month targets", () => {
    const state = emptyState();
    const next = addHolidays(state, date, date, "Nghỉ lễ", now);
    expect(next.days[date]).toEqual({ ...newDay(date), kind: "holiday", note: "Nghỉ lễ" });
    expect(state.days).toEqual({});
    const week = [date, "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"];
    expect(summarize(next, week, now).target).toBe(4 * 8 * 3600);
    expect(summarize(next, monthDates("2026-11"), now).target).toBe(20 * 8 * 3600);
    expect(summarize(next, week, now).worked).toBe(0);
    expect(summarize(next, week, now).futureDays).toBe(4);
  });

  it("does not reduce the target for a weekend holiday", () => {
    const state = emptyState();
    const next = addHolidays(state, "2026-11-14", "2026-11-14", "", now);
    expect(summarize(next, monthDates("2026-11"), now).target)
      .toBe(summarize(state, monthDates("2026-11"), now).target);
  });

  it("adds an inclusive range across weekdays and weekends with the same note", () => {
    const state = addHolidays(emptyState(), "2026-11-13", "2026-11-16", "Nghỉ dài", now);
    expect(Object.keys(state.days)).toEqual(["2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"]);
    for (const [date, day] of Object.entries(state.days))
      expect(day).toEqual({ ...newDay(date), kind: "holiday", note: "Nghỉ dài" });
    expect(summarize(state, monthDates("2026-11"), now).target).toBe(19 * 8 * 3600);
    expect(summarize(state, monthDates("2026-11"), now).worked).toBe(0);
  });

  it("handles month/year boundaries, leap days and the maximum supported date", () => {
    const state = addHolidays(emptyState(), "2026-12-31", "2027-01-02", "Tết", now);
    expect(Object.keys(state.days)).toEqual(["2026-12-31", "2027-01-01", "2027-01-02"]);
    expect(summarize(state, monthDates("2026-12"), now).target)
      .toBe(summarize(emptyState(), monthDates("2026-12"), now).target - 8 * 3600);
    expect(summarize(state, monthDates("2027-01"), now).target)
      .toBe(summarize(emptyState(), monthDates("2027-01"), now).target - 8 * 3600);
    expect(Object.keys(addHolidays(emptyState(), "2024-02-28", "2024-03-01", "", now).days))
      .toEqual(["2024-02-28", "2024-02-29", "2024-03-01"]);
    expect(Object.keys(addHolidays(emptyState(), "2100-12-31", "2100-12-31", "", now).days))
      .toEqual(["2100-12-31"]);
  });

  it("rejects every existing day without overwriting work, leave, plans, notes or holidays", () => {
    const records = [
      { ...newDay(date), sessions: [{ start: dayStart(date), end: dayStart(date) + 3600000 }] },
      { ...newDay(date), kind: "leave" as const },
      { ...newDay(date, "wfh"), request: "sent" as const },
      { ...newDay(date), note: "Ghi chú cần giữ" },
      { ...newDay(date), kind: "holiday" as const, note: "Lễ cũ" },
      newDay(date),
    ];
    for (const record of records) {
      const state = emptyState();
      state.days[record.date] = record;
      const before = structuredClone(state);
      expect(() => addHolidays(state, "2026-11-15", "2026-11-17", "Mới", now))
        .toThrow("Ngày 16/11/2026 đã có dữ liệu. Hãy mở Chỉnh sửa ngày");
      expect(state).toEqual(before);
    }
  });

  it("validates dates, note length and the existing storage cap without changing input", () => {
    const state = emptyState();
    for (const [from, to] of [["2026-02-30", date], [date, "2026-02-30"],
      ["2026-11-17", date], ["1999-12-31", date], [date, "2101-01-01"], ["", date]])
      expect(() => addHolidays(state, from, to, "", now)).toThrow("không hợp lệ");
    expect(state.days).toEqual({});
    expect(() => addHolidays(state, date, date, "a".repeat(1001), now)).toThrow("không hợp lệ");
    expect(addHolidays(state, date, date, "a".repeat(1000), now).days[date].note).toHaveLength(1000);
    for (let i = 0; i < 900; i++) {
      const key = new Date(Date.UTC(2020, 0, i + 1)).toISOString().slice(0, 10);
      state.days[key] = { ...newDay(key), note: "a".repeat(1000) };
    }
    expect(() => addHolidays(state, date, "2026-11-18", "", now)).toThrow("Sổ đã gần đầy");
    expect(state.days[date]).toBeUndefined();
  });

  it("deletes only a holiday, restores its target, and preserves other days and the input", () => {
    const state = addHolidays(emptyState(), date, "2026-11-17", "Lễ", now);
    state.days["2026-11-02"] = { ...newDay("2026-11-02"), note: "Giữ lại" };
    const next = removeHoliday(state, date, now);
    expect(next.days[date]).toBeUndefined();
    expect(summarize(next, monthDates("2026-11"), now).target).toBe(20 * 8 * 3600);
    expect(next.days["2026-11-17"]).toEqual(state.days["2026-11-17"]);
    expect(next.days["2026-11-02"]).toEqual(state.days["2026-11-02"]);
    expect(state.days[date].kind).toBe("holiday");
    expect(() => removeHoliday(next, date, now)).toThrow("không còn là ngày lễ");
    expect(() => removeHoliday(next, "2026-11-02", now)).toThrow("không còn là ngày lễ");
    expect(next.days["2026-11-02"].note).toBe("Giữ lại");
  });
});
