import { expect, it } from "vitest";
import { emptyState, setWfhHours } from "@/modules/tracking/core/domain";
import { mergeStates, sameContent } from "@/modules/tracking/data/merge";
const now = Date.parse("2026-11-20T12:00:00+07:00");
const base = () => setWfhHours(emptyState(), "2026-11-02", 8, now);

it("compares content without depending on field insertion order or ledger versions", () => {
  const left = base(), right = structuredClone(left);
  right.version = 46;
  right.days["2026-11-02"] = { ...right.days["2026-11-02"], note: "" };
  expect(sameContent(left, right)).toBe(true);
});
it("preserves intentional deletions against an unchanged baseline", () => {
  const result = mergeStates(emptyState(), base(), base());
  expect(result.days).toEqual({});
});
it("refuses a deletion that collides with a remote edit", () => {
  const edited = setWfhHours(base(), "2026-11-02", 10, now);
  expect(() => mergeStates(emptyState(), edited, base())).toThrow("2026-11-02");
});
it("preserves a remote deletion when only a different date is edited locally", () => {
  const edited = setWfhHours(base(), "2026-11-19", 8, now);
  expect(Object.keys(mergeStates(edited, emptyState(), base()).days)).toEqual(["2026-11-19"]);
});
it("keeps remote settings when the local settings were not edited", () => {
  const remote = { ...base(), settings: { ...base().settings, lunchMinutes: 30 } };
  expect(mergeStates(base(), remote, base()).settings.lunchMinutes).toBe(30);
});
it("does not pick a winner for incompatible settings without a baseline", () => {
  const remote = { ...base(), settings: { ...base().settings, lunchMinutes: 30 } };
  expect(() => mergeStates(base(), remote)).toThrow("cài đặt");
});
it("refuses combinations that violate the one-active-session invariant", () => {
  const left = emptyState(), right = emptyState();
  left.days["2026-11-02"] = { date:"2026-11-02",mode:"office",kind:"work",request:"none",note:"",sessions:[{start:Date.parse("2026-11-02T09:00:00+07:00"),end:null}] };
  right.days["2026-11-03"] = { date:"2026-11-03",mode:"office",kind:"work",request:"none",note:"",sessions:[{start:Date.parse("2026-11-03T09:00:00+07:00"),end:null}] };
  expect(() => mergeStates(left, right)).toThrow("ca trùng nhau hoặc dữ liệu không hợp lệ");
});
