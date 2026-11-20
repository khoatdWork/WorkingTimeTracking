import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyState, setWfhHours, type TrackerState } from "@/modules/tracking/core/domain";
import { LOCAL_KEY, localKey, openLocal, readBackup, readLocal, readRevisions, storeBackup, writeLocal } from "@/modules/tracking/data/repository";
vi.mock("@/modules/tracking/data/cloud", () => ({ readCloud: vi.fn(), writeCloud: vi.fn() }));
import { readCloud, writeCloud } from "@/modules/tracking/data/cloud";
import { syncBackup } from "@/modules/tracking/data/sync";

const items = new Map<string, string>();
const wfh = () => setWfhHours(emptyState(), "2026-11-02", 10, Date.now());
beforeEach(() => {
  items.clear();
  vi.resetAllMocks();
  vi.stubGlobal("navigator", { onLine: true });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
    removeItem: (key: string) => items.delete(key),
  });
  vi.mocked(readCloud).mockResolvedValue(emptyState());
  vi.mocked(writeCloud).mockImplementation(async (_, state, version) => ({ ...state, version: version + 1 }));
});
afterEach(() => vi.unstubAllGlobals());

describe("local-first startup sync", () => {
  it("claims existing device data once and uploads it using the Firebase version", async () => {
    writeLocal(wfh(), 0);
    const local = openLocal("a");
    expect(items.has(LOCAL_KEY)).toBe(true); // Keep the original guest copy for recovery.
    vi.mocked(readCloud).mockResolvedValue({ ...emptyState(), version: 12 });
    await syncBackup("a", () => true);
    expect(writeCloud).toHaveBeenCalledWith("a", expect.objectContaining({ days: local.state.days }), 12);
    expect(readBackup("a")).toMatchObject({ state: local.state, cloudVersion: 13, dirty: false });
    expect(openLocal("b").state.days).toEqual({});
    expect(readLocal("a").days).toEqual(local.state.days);
  });
  it("downloads Firebase on a new device, saves a local copy, and pulls later remote updates", async () => {
    openLocal(null); // A pristine device placeholder must not overwrite Firebase.
    openLocal("a");
    vi.mocked(readCloud).mockResolvedValue({ ...wfh(), version: 4 });
    await syncBackup("a", () => true);
    expect(readLocal("a").days).toEqual(wfh().days);
    expect(readBackup("a")).toMatchObject({ cloudVersion: 4, dirty: false });
    expect(writeCloud).not.toHaveBeenCalled();
    const version = readLocal("a").version;
    vi.mocked(readCloud).mockResolvedValue({ ...emptyState(), version: 5 });
    await syncBackup("a", () => true);
    expect(readLocal("a").days).toEqual({});
    expect(readLocal("a").version).toBeGreaterThan(version);
  });
  it("keeps offline edits through reopening and prioritizes local changes on reconnect", async () => {
    openLocal("a");
    const saved = writeLocal(wfh(), 0, "a");
    vi.mocked(readCloud).mockRejectedValueOnce(new Error("offline"));
    await expect(syncBackup("a", () => true)).rejects.toThrow("offline");
    expect(openLocal("a")).toMatchObject({ state: saved, dirty: true });
    await syncBackup("a", () => true);
    expect(readBackup("a")?.dirty).toBe(false);
    expect(writeCloud).toHaveBeenCalledWith("a", saved, 0);
  });
  it("never marks synced before the server acknowledges, and retains data on failure", async () => {
    openLocal("a");
    writeLocal(wfh(), 0, "a");
    let reject!: (e: Error) => void;
    vi.mocked(writeCloud).mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    const task = syncBackup("a", () => true);
    await vi.waitFor(() => expect(writeCloud).toHaveBeenCalled());
    expect(readBackup("a")?.dirty).toBe(true);
    reject(new Error("transaction conflict"));
    await expect(task).rejects.toThrow("transaction conflict");
    expect(readBackup("a")?.dirty).toBe(true);
    expect(readLocal("a").days).toEqual(wfh().days);
  });
  it("keeps edits made during upload pending and sends them in the next sync", async () => {
    openLocal("a");
    const first = writeLocal(wfh(), 0, "a");
    let acknowledge!: (value: TrackerState) => void;
    vi.mocked(writeCloud).mockReturnValueOnce(new Promise((resolve) => { acknowledge = resolve; }));
    const task = syncBackup("a", () => true);
    await vi.waitFor(() => expect(writeCloud).toHaveBeenCalled());
    const next = { ...first, settings: { ...first.settings, lunchMinutes: 30 } };
    writeLocal(next, first.version, "a");
    acknowledge({ ...first, version: 1 });
    await task;
    expect(readBackup("a")).toMatchObject({ cloudVersion: 1, dirty: true, state: { settings: { lunchMinutes: 30 } } });
    vi.mocked(readCloud).mockResolvedValue({ ...first, version: 1 });
    await syncBackup("a", () => true);
    expect(readBackup("a")?.dirty).toBe(false);
    expect(readLocal("a").settings.lunchMinutes).toBe(30);
  });
  it("does not overwrite an edit during download or write into another account after switching", async () => {
    openLocal("a");
    let respond!: (value: TrackerState) => void;
    vi.mocked(readCloud).mockReturnValueOnce(new Promise((resolve) => { respond = resolve; }));
    const pull = syncBackup("a", () => true);
    writeLocal(wfh(), 0, "a");
    respond({ ...emptyState(), version: 9 });
    await pull;
    expect(readBackup("a")).toMatchObject({ cloudVersion: 9, dirty: true });
    let active = true;
    vi.mocked(readCloud).mockReturnValueOnce(new Promise((resolve) => { respond = resolve; }));
    const switched = syncBackup("a", () => active);
    active = false;
    openLocal("b");
    respond({ ...emptyState(), version: 9 });
    await switched;
    expect(writeCloud).not.toHaveBeenCalled();
    expect(readLocal("b").days).toEqual({});
  });
  it("keeps an explicit local reset pending and refuses stale edits", async () => {
    storeBackup("a", { state: { ...wfh(), version: 5 }, base: { ...wfh(), version: 7 }, cloudVersion: 7, dirty: false });
    writeLocal(emptyState(), 5, "a");
    expect(() => writeLocal(wfh(), 5, "a")).toThrow("tab khác");
    vi.mocked(readCloud).mockResolvedValue({ ...wfh(), version: 7 });
    await syncBackup("a", () => true);
    expect(writeCloud).toHaveBeenCalledWith("a", expect.objectContaining({ days: {} }), 7);
    expect(readBackup("a")?.dirty).toBe(false);
  });
  it("does not mark the old account synced when auth changes during an upload", async () => {
    openLocal("a");
    const saved = writeLocal(wfh(), 0, "a");
    let active = true;
    let acknowledge!: (state: TrackerState) => void;
    vi.mocked(writeCloud).mockReturnValueOnce(new Promise((resolve) => { acknowledge = resolve; }));
    const task = syncBackup("a", () => active);
    await vi.waitFor(() => expect(writeCloud).toHaveBeenCalled());
    active = false;
    openLocal("b");
    acknowledge({ ...saved, version: 1 });
    expect(await task).toBe(null);
    expect(readBackup("a")?.dirty).toBe(true);
    expect(readLocal("b").days).toEqual({});
  });
  it("preserves corrupt and quota-limited backups instead of silently replacing them", () => {
    items.set(localKey("a"), "broken");
    expect(() => openLocal("a")).toThrow();
    expect(items.get(localKey("a"))).toBe("broken");
    writeLocal(wfh(), 0);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: () => { throw new Error("quota"); },
    });
    expect(() => openLocal("b")).toThrow("Không lưu được");
    expect(items.has(LOCAL_KEY)).toBe(true);
  });
});

describe("data-loss regression protection", () => {
  it("preserves cloud-only November dates when an unknown guest ledger is adopted", async () => {
    const guest = setWfhHours(emptyState(), "2026-11-19", 8, Date.now());
    writeLocal(guest, 0);
    openLocal("a");
    const cloud = { ...wfh(), version: 46 };
    vi.mocked(readCloud).mockResolvedValue(cloud);
    await syncBackup("a", () => true);
    expect(Object.keys(readLocal("a").days).sort()).toEqual(["2026-11-02", "2026-11-19"]);
    expect(readRevisions("a").some(r => r.state.days["2026-11-02"])).toBe(true);
    expect(readLocal().days).toEqual(guest.days);
    expect(openLocal("b").state.days).toEqual({});
  });
  it("does not let an old empty dirty copy delete newer cloud records", async () => {
    storeBackup("a", { state: { ...emptyState(), version: 2 }, cloudVersion: 1, dirty: true });
    vi.mocked(readCloud).mockResolvedValue({ ...wfh(), version: 46 });
    await syncBackup("a", () => true);
    expect(writeCloud).not.toHaveBeenCalled();
    expect(readLocal("a").days).toEqual(wfh().days);
  });
  it("does not trust a legacy cloudVersion as permission to delete without the baseline contents", async () => {
    storeBackup("a", { state: { ...emptyState(), version: 2 }, cloudVersion: 46, dirty: true });
    vi.mocked(readCloud).mockResolvedValue({ ...wfh(), version: 46 });
    await syncBackup("a", () => true);
    expect(writeCloud).not.toHaveBeenCalled();
    expect(readLocal("a").days).toEqual(wfh().days);
  });
  it.each([null, { ...emptyState(), version: 1 }])("refuses a missing or regressed cloud without clearing local: %s", async remote => {
    storeBackup("a", { state: { ...wfh(), version: 5 }, cloudVersion: 4, dirty: false });
    vi.mocked(readCloud).mockResolvedValue(remote);
    await expect(syncBackup("a", () => true)).rejects.toThrow("thiếu hoặc lùi");
    expect(readLocal("a").days).toEqual(wfh().days);
    expect(writeCloud).not.toHaveBeenCalled();
  });
  it("stops unknown same-day conflicts, preserves both copies, and leaves local pending", async () => {
    openLocal("a");
    writeLocal(wfh(), 0, "a");
    const remote = { ...setWfhHours(emptyState(), "2026-11-02", 8, Date.now()), version: 46 };
    vi.mocked(readCloud).mockResolvedValue(remote);
    await expect(syncBackup("a", () => true)).rejects.toThrow("khác nhau");
    expect(writeCloud).not.toHaveBeenCalled();
    expect(readBackup("a")?.dirty).toBe(true);
    expect(readLocal("a").days["2026-11-02"].wfhHours).toBe(10);
    expect(readRevisions("a")[0].state).toEqual(remote);
  });
  it("merges independent edits using the acknowledged baseline", async () => {
    const base = { ...wfh(), version: 4 };
    const local = setWfhHours(base, "2026-11-19", 8, Date.now());
    storeBackup("a", { state: { ...local, version: 6 }, base, cloudVersion: 4, dirty: true });
    const remote = { ...setWfhHours(base, "2026-11-03", 8, Date.now()), version: 5 };
    vi.mocked(readCloud).mockResolvedValue(remote);
    await syncBackup("a", () => true);
    expect(Object.keys(readLocal("a").days).sort()).toEqual(["2026-11-02", "2026-11-03", "2026-11-19"]);
    expect(readBackup("a")).toMatchObject({ cloudVersion: 6, dirty: false, base: { version: 6 } });
  });
  it("does not erase the first cloud pull when the user edits the empty placeholder", async () => {
    openLocal("a");
    let respond!: (state: TrackerState) => void;
    vi.mocked(readCloud).mockReturnValueOnce(new Promise(resolve => { respond = resolve; }));
    const task = syncBackup("a", () => true);
    writeLocal(setWfhHours(emptyState(), "2026-11-19", 8, Date.now()), 0, "a");
    const remote = { ...wfh(), version: 46 };
    respond(remote);
    await task;
    expect(readBackup("a")?.dirty).toBe(true);
    expect(Object.keys(readLocal("a").days).sort()).toEqual(["2026-11-02", "2026-11-19"]);
    vi.mocked(readCloud).mockResolvedValue(remote);
    await syncBackup("a", () => true);
    expect(Object.keys(vi.mocked(writeCloud).mock.calls[0][1].days).length).toBe(2);
  });
  it("keeps edits during a merged upload and includes remotely added days", async () => {
    openLocal("a");
    const first = writeLocal(wfh(), 0, "a");
    const remote = { ...setWfhHours(emptyState(), "2026-11-03", 8, Date.now()), version: 46 };
    vi.mocked(readCloud).mockResolvedValue(remote);
    let acknowledge!: (state: TrackerState) => void;
    vi.mocked(writeCloud).mockReturnValueOnce(new Promise(resolve => { acknowledge = resolve; }));
    const task = syncBackup("a", () => true);
    await vi.waitFor(() => expect(writeCloud).toHaveBeenCalled());
    writeLocal(setWfhHours(first, "2026-11-02", 8, Date.now()), first.version, "a");
    acknowledge({ ...vi.mocked(writeCloud).mock.calls[0][1], version: 47 });
    await task;
    expect(readLocal("a").days["2026-11-02"].wfhHours).toBe(8);
    expect(readLocal("a").days["2026-11-03"].wfhHours).toBe(8);
    expect(readBackup("a")?.dirty).toBe(true);
  });
  it("refuses replacement when the recovery checkpoint cannot persist", async () => {
    storeBackup("a", { state: wfh(), cloudVersion: 4, dirty: false });
    vi.mocked(readCloud).mockResolvedValue({ ...emptyState(), version: 5 });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: () => { throw new Error("quota"); },
    });
    await expect(syncBackup("a", () => true)).rejects.toThrow("Không lưu được");
    expect(readLocal("a").days).toEqual(wfh().days);
  });
  it("refuses uploading over cloud when preserving its current copy fails", async () => {
    openLocal("a");
    writeLocal(setWfhHours(emptyState(), "2026-11-19", 8, Date.now()), 0, "a");
    vi.mocked(readCloud).mockResolvedValue({ ...wfh(), version: 46 });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: () => { throw new Error("quota"); },
    });
    await expect(syncBackup("a", () => true)).rejects.toThrow("Không lưu được bản phục hồi");
    expect(writeCloud).not.toHaveBeenCalled();
    expect(readBackup("a")?.dirty).toBe(true);
    expect(Object.keys(readLocal("a").days)).toEqual(["2026-11-19"]);
  });
});
