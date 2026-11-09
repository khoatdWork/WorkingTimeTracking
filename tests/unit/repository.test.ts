import { afterEach, describe, it, expect, vi } from "vitest";
import { emptyState, setWfhHours, workedSeconds } from "@/modules/tracking/core/domain";
import {
  readLocal,
  writeLocal,
  exportCsv,
  LOCAL_KEY,
} from "@/modules/tracking/data/repository";
afterEach(() => vi.unstubAllGlobals());
describe("device storage", () => {
  it("persists only on success and rejects stale tabs", () => {
    const items = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => items.get(k) ?? null,
      setItem: (k: string, v: string) => items.set(k, v),
    });
    expect(readLocal()).toEqual(emptyState());
    const saved = writeLocal(emptyState(), 0);
    expect(readLocal()).toEqual(saved);
    expect(saved.version).toBe(1);
    expect(() => writeLocal(emptyState(), 0)).toThrow("tab khác");
    items.set(LOCAL_KEY, "broken");
    expect(() => readLocal()).toThrow();
  });
  it("keeps prior data if storage is full", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => writeLocal(emptyState(), 0)).toThrow(
      "Không lưu được trên thiết bị",
    );
  });
  it("quotes export notes to prevent malformed columns", () => {
    const state = emptyState();
    state.days["2026-11-02"] = {
      date: "2026-11-02",
      kind: "work",
      mode: "wfh",
      request: "sent",
      sessions: [],
      note: 'A, "B"\nC',
    };
    expect(exportCsv(state, Date.now())).toContain('"A, ""B""\nC"');
    state.days["2026-11-02"].note = '=HYPERLINK("https://example.test")';
    expect(exportCsv(state, Date.now())).toContain('"\'=HYPERLINK');
  });
  it("round-trips fixed WFH hours and exports hours without invented clock times", () => {
    const items = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => items.get(k) ?? null,
      setItem: (k: string, v: string) => items.set(k, v),
    });
    const now = Date.now();
    const state = setWfhHours(emptyState(), "2026-11-02", 10, now);
    writeLocal(state, 0);
    expect(workedSeconds(readLocal(), "2026-11-02", now)).toBe(36000);
    const csv = exportCsv(readLocal(), now);
    expect(csv).toContain("Giờ WFH đã ghi nhận");
    expect(csv).toContain('"2026-11-02","WFH","none","work","","","10",""');
  });
});
