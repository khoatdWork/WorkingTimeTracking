import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { emptyState, newDay } from "@/modules/tracking/core/domain";
vi.mock("@/lib/firebase/client", () => ({ firebaseClients: vi.fn() }));
import { firebaseClients } from "@/lib/firebase/client";
import { readCloud, readCloudHistory, writeCloud } from "@/modules/tracking/data/cloud";
let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-working-time",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});
beforeEach(async () => {
  await env.clearFirestore();
});
afterAll(async () => {
  await env?.cleanup();
});
const seed = () => ({ ...emptyState(), version: 1 });
describe("Firestore owner isolation and versions", () => {
  it("permits owner and rejects anonymous or another user", async () => {
    const a = env.authenticatedContext("a").firestore(),
      b = env.authenticatedContext("b").firestore(),
      anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(a, "users/a/tracker/state"), seed()));
    await assertSucceeds(getDoc(doc(a, "users/a/tracker/state")));
    await assertFails(getDoc(doc(b, "users/a/tracker/state")));
    await assertFails(getDoc(doc(anon, "users/a/tracker/state")));
    await assertFails(
      setDoc(doc(b, "users/a/tracker/state"), { ...seed(), version: 2 }),
    );
    await assertFails(setDoc(doc(anon, "users/a/tracker/state"), seed()));
    await assertFails(deleteDoc(doc(a, "users/a/tracker/state")));
  });
  it("requires valid settings, exact shape and incrementing version", async () => {
    const a = env.authenticatedContext("a").firestore(),
      ref = doc(a, "users/a/tracker/state");
    await assertFails(setDoc(ref, { ...seed(), version: 2 }));
    await assertFails(
      setDoc(ref, {
        ...seed(),
        settings: { dailyMinutes: 480, lunchMinutes: -1, wfhLimit: 3 },
      }),
    );
    await assertFails(setDoc(ref, { ...seed(), extra: true }));
    await assertSucceeds(setDoc(ref, seed()));
    await assertFails(setDoc(ref, seed()));
    const next = { ...seed(), version: 2, days: {
      "2026-11-02": { ...newDay("2026-11-02", "wfh"), wfhHours: 10 },
    } };
    await assertFails(setDoc(ref, next)); // Legacy clients cannot skip preservation.
    const batch = writeBatch(a);
    batch.set(doc(a, "users/a/trackerHistory/1"), seed());
    batch.set(ref, next);
    await assertSucceeds(batch.commit());
    await assertFails(setDoc(doc(a, "users/a/other/state"), seed()));
  });
  it("keeps server history immutable, truthful and owner-only", async () => {
    const a = env.authenticatedContext("a").firestore(),
      b = env.authenticatedContext("b").firestore(),
      anon = env.unauthenticatedContext().firestore();
    const ref = doc(a, "users/a/tracker/state"), history = doc(a, "users/a/trackerHistory/1");
    await assertSucceeds(setDoc(ref, seed()));
    await assertFails(setDoc(history, { ...seed(), settings: { ...seed().settings, lunchMinutes: 0 } }));
    await assertFails(setDoc(doc(a, "users/a/trackerHistory/2"), seed()));
    const batch = writeBatch(a);
    batch.set(history, seed());
    batch.set(ref, { ...seed(), version: 2 });
    await assertSucceeds(batch.commit());
    await assertSucceeds(getDoc(history));
    await assertFails(setDoc(history, seed()));
    await assertFails(deleteDoc(history));
    await assertFails(getDoc(doc(b, "users/a/trackerHistory/1")));
    await assertFails(getDoc(doc(anon, "users/a/trackerHistory/1")));
    await assertFails(setDoc(doc(b, "users/a/trackerHistory/2"), { ...seed(), version: 2 }));
    await assertFails(setDoc(ref, { ...seed(), version: 3 }));
    const invalid = writeBatch(a);
    invalid.set(doc(a, "users/a/trackerHistory/2"), { ...seed(), version: 2, days: {
      "2026-11-02": { ...newDay("2026-11-02", "wfh"), wfhHours: 10 },
    } });
    invalid.set(ref, { ...seed(), version: 3 });
    await assertFails(invalid.commit());
    expect((await getDoc(ref)).data()?.version).toBe(2);
  });
  it("executes the actual SDK transaction with history, acknowledgement, and concurrent-write rejection", async () => {
    const a = env.authenticatedContext("a").firestore();
    vi.mocked(firebaseClients).mockReturnValue({ db: a, auth: { currentUser: { uid: "a" } } } as unknown as ReturnType<typeof firebaseClients>);
    expect(await readCloud("a")).toBeNull();
    const initial = { ...seed(), days: { "2026-11-02": { ...newDay("2026-11-02", "wfh"), wfhHours: 8 as const } } };
    await writeCloud("a", initial, 0);
    expect(await readCloud("a")).toEqual(initial);
    const second = await writeCloud("a", { ...initial, settings: { ...initial.settings, lunchMinutes: 30 } }, 1);
    expect(second.version).toBe(2);
    expect(await readCloudHistory("a")).toEqual([initial]);
    await expect(writeCloud("a", emptyState(), 1)).rejects.toThrow("thiết bị khác");
    await writeCloud("a", emptyState(), 2);
    const history = await readCloudHistory("a");
    expect(history).toEqual([second, initial]);
    const results = await Promise.allSettled([
      writeCloud("a", initial, 3),
      writeCloud("a", { ...initial, settings: { ...initial.settings, lunchMinutes: 0 } }, 3),
    ]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter(result => result.status === "rejected")).toHaveLength(1);
    expect((await readCloud("a"))?.version).toBe(4);
    expect((await readCloudHistory("a")).map(state => state.version)).toEqual([3, 2, 1]);
  });
});
