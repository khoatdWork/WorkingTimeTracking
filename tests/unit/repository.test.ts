import { afterEach, describe, it, expect, vi } from "vitest";
import { emptyState, setWfhHours, workedSeconds } from "@/modules/tracking/core/domain";
import {
  readLocal,
  writeLocal,
  exportCsv,
  LOCAL_KEY,
  readAccount,
  rememberAccount,
  readRevisions,
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

it("remembers a previous account, discovers a legacy ledger, and distinguishes deliberate sign-out", () => {
  const items = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
    get length() { return items.size; },
    key: (index: number) => [...items.keys()][index] ?? null,
  });
  expect(readAccount()).toBeNull();
  items.set(`${LOCAL_KEY}:a`, JSON.stringify({state:emptyState(),cloudVersion:1,dirty:false}));
  expect(readAccount()?.uid).toBe("a");
  rememberAccount({ uid: "a", label: "Account A" });
  expect(readAccount()).toEqual({uid:"a",label:"Account A"});
  rememberAccount(null);
  expect(readAccount()).toBeNull();
});

it("preserves a recoverable prior ledger before deletion/import and fails closed if recovery cannot persist", () => {
  const items = new Map<string, string>();
  const setItem = (key: string, value: string) => items.set(key, value);
  vi.stubGlobal("localStorage", { getItem: (key: string) => items.get(key) ?? null, setItem });
  const state = setWfhHours(emptyState(), "2026-11-02", 8, Date.now());
  writeLocal(state, 0);
  writeLocal(emptyState(), 1);
  expect(readRevisions(null)[0].state.days).toEqual(state.days);
  const saved = readLocal();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: () => { throw new Error("quota"); },
  });
  expect(() => writeLocal(state, saved.version)).toThrow("Không lưu được");
  expect(readLocal()).toEqual(saved);
});
it("bounds history growth while retaining the previous state needed to undo the last edit", () => {
  const items = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
  });
  let state = emptyState();
  for (let i = 0; i < 15; i++) {
    state = writeLocal({ ...state, settings: { ...state.settings, lunchMinutes: i } }, state.version);
  }
  const revisions = readRevisions(null);
  expect(revisions.length).toBeLessThanOrEqual(10);
  expect(revisions[0].state.settings.lunchMinutes).toBe(13);
  expect(readLocal().settings.lunchMinutes).toBe(14);
});
