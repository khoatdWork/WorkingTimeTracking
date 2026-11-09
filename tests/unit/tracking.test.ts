import { describe, it, expect } from "vitest";
import {
  activeSession,
  addDays,
  dateKey,
  dayStart,
  duration,
  emptyState,
  grossSeconds,
  monthDates,
  newDay,
  readableDuration,
  startWork,
  stopWork,
  summarize,
  targetSeconds,
  validateState,
  weekStart,
  wfhDays,
  workedSeconds,
  type TrackerState,
} from "@/modules/tracking/core/domain";
const now = Date.parse("2026-11-30T23:00:00+07:00");
function hours(state: TrackerState, date: string, start: number, end: number) {
  state.days[date] = {
    ...newDay(date),
    sessions: [
      {
        start: dayStart(date) + start * 3600000,
        end: dayStart(date) + end * 3600000,
      },
    ],
  };
}
describe("exact working time and monthly carry", () => {
  it("6 hours + 10 hours net balances two 8-hour days", () => {
    const state = emptyState();
    hours(state, "2026-11-02", 9, 16);
    hours(state, "2026-11-03", 8, 19);
    const total = summarize(state, ["2026-11-02", "2026-11-03"], now);
    expect(total.worked).toBe(16 * 3600);
    expect(total.balance).toBe(0);
  });
  it("deducts lunch once across multiple sessions, pauses exclude extra time", () => {
    const state = emptyState();
    const date = "2026-11-02",
      start = dayStart(date);
    state.days[date] = {
      ...newDay(date),
      sessions: [
        { start: start + 9 * 3600000, end: start + 12 * 3600000 },
        { start: start + 13 * 3600000, end: start + 19 * 3600000 },
      ],
    };
    expect(grossSeconds(state, date, now)).toBe(9 * 3600);
    expect(workedSeconds(state, date, now)).toBe(8 * 3600);
  });
  it("never rounds a missing second or minute into completed hours", () => {
    const state = emptyState();
    hours(state, "2026-11-02", 9, 18);
    state.days["2026-11-02"].sessions[0].end! -= 1000;
    expect(summarize(state, ["2026-11-02"], now).remaining).toBe(1);
    expect(duration(workedSeconds(state, "2026-11-02", now), true)).toBe(
      "07:59:59",
    );
    expect(readableDuration(1)).toBe("1 giây");
  });
  it("uses Vietnam date and splits work at local midnight", () => {
    expect(dateKey(Date.parse("2026-11-01T18:00:00Z"))).toBe("2026-11-02");
    const state = emptyState();
    state.settings.lunchMinutes = 0;
    hours(state, "2026-11-02", 23, 26);
    expect(workedSeconds(state, "2026-11-02", now)).toBe(3600);
    expect(workedSeconds(state, "2026-11-03", now)).toBe(7200);
  });
  it("clamps active sessions to now and survives reload with timestamp", () => {
    const time = Date.parse("2026-11-02T09:00:00+07:00");
    const state = startWork(emptyState(), "office", time);
    expect(
      activeSession(JSON.parse(JSON.stringify(state)))?.session.start,
    ).toBe(time);
    expect(workedSeconds(state, "2026-11-02", time + 9 * 3600000)).toBe(
      8 * 3600,
    );
    const stopped = stopWork(state, time + 9 * 3600000);
    expect(activeSession(stopped)).toBeNull();
  });
  it("no target on weekends, leave and holidays, still counts weekend make-up", () => {
    const state = emptyState();
    hours(state, "2026-11-07", 9, 18);
    state.days["2026-11-02"] = { ...newDay("2026-11-02"), kind: "holiday" };
    state.days["2026-11-03"] = { ...newDay("2026-11-03"), kind: "leave" };
    expect(targetSeconds(state, "2026-11-07")).toBe(0);
    expect(targetSeconds(state, "2026-11-02")).toBe(0);
    expect(targetSeconds(state, "2026-11-03")).toBe(0);
    expect(workedSeconds(state, "2026-11-07", now)).toBe(8 * 3600);
  });
  it("counts actual weekdays and isolates monthly carry from cross-month weeks", () => {
    const state = emptyState();
    hours(state, "2026-10-30", 8, 20);
    expect(weekStart("2026-11-01")).toBe("2026-10-26");
    expect(monthDates("2026-11")).toHaveLength(30);
    const summary = summarize(state, monthDates("2026-11"), now);
    expect(summary.target).toBe(21 * 8 * 3600);
    expect(summary.worked).toBe(0);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(monthDates("2024-02")).toHaveLength(29);
  });
  it("separates elapsed deficit from entire month remaining", () => {
    const state = emptyState();
    hours(state, "2026-11-02", 9, 16);
    const summary = summarize(
      state,
      monthDates("2026-11"),
      Date.parse("2026-11-02T23:00:00+07:00"),
    );
    expect(summary.balance).toBe(-2 * 3600);
    expect(summary.remaining).toBe((21 * 8 - 6) * 3600);
    expect(summary.futureDays).toBe(20);
  });
  it("WFH counts dates once regardless of number of sessions and includes planned dates", () => {
    const state = emptyState();
    state.days["2026-11-02"] = {
      ...newDay("2026-11-02", "wfh"),
      request: "sent",
    };
    expect(wfhDays(state, ["2026-11-02", "2026-11-03"])).toHaveLength(1);
  });
});
describe("data validation", () => {
  it("rejects duplicate active sessions and overlapping intervals", () => {
    const state = emptyState();
    hours(state, "2026-11-02", 9, 18);
    state.days["2026-11-02"].sessions.push({
      start: dayStart("2026-11-02") + 10 * 3600000,
      end: dayStart("2026-11-02") + 12 * 3600000,
    });
    expect(() => validateState(state, now)).toThrow("trùng giờ");
    state.days["2026-11-02"].sessions = [
      { start: dayStart("2026-11-02"), end: null },
      { start: dayStart("2026-11-02") + 1000, end: null },
    ];
    expect(() => validateState(state, now)).toThrow("một ca");
  });
  it("rejects impossible dates, future hours, reversed and too long sessions", () => {
    const state = emptyState();
    state.days["2026-02-30"] = newDay("2026-02-30");
    expect(() => validateState(state, now)).toThrow();
    delete state.days["2026-02-30"];
    hours(state, "2026-12-01", 9, 18);
    expect(() => validateState(state, now)).toThrow();
    delete state.days["2026-12-01"];
    hours(state, "2026-11-02", 18, 9);
    expect(() => validateState(state, now)).toThrow();
    hours(state, "2026-11-02", 0, 25);
    expect(() => validateState(state, now)).toThrow();
  });
  it("rejects corrupt settings, excessive data, unsupported imports and leave with sessions", () => {
    expect(() => validateState({ schema: 2 }, now)).toThrow();
    const state = emptyState();
    state.settings.lunchMinutes = -1;
    expect(() => validateState(state, now)).toThrow();
    state.settings.lunchMinutes = 60;
    hours(state, "2026-11-02", 9, 18);
    state.days["2026-11-02"].kind = "leave";
    expect(() => validateState(state, now)).toThrow();
  });
  it("allows request planning, pause/resume and final state validation", () => {
    const time = Date.parse("2026-11-02T09:00:00+07:00");
    let state = startWork(emptyState(), "wfh", time);
    expect(() => startWork(state, "office", time + 1000)).toThrow();
    state = stopWork(state, time + 3600000);
    state = startWork(state, "wfh", time + 7200000);
    state = stopWork(state, time + 9 * 3600000);
    expect(validateState(state, now)).toBe(state);
    expect(state.days["2026-11-02"].sessions).toHaveLength(2);
  });
});
