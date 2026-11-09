import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { beforeAll, beforeEach, afterAll, describe, it } from "vitest";
import { emptyState, newDay } from "@/modules/tracking/core/domain";
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
    await assertSucceeds(setDoc(ref, { ...seed(), version: 2, days: {
      "2026-11-02": { ...newDay("2026-11-02", "wfh"), wfhHours: 10 },
    } }));
    await assertFails(setDoc(doc(a, "users/a/other/state"), seed()));
  });
});
