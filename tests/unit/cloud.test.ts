import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { emptyState } from "../../src/modules/tracking/core/domain";

vi.mock("@/lib/firebase/client", () => ({ firebaseClients: vi.fn() }));
const firestore = vi.hoisted(() => ({
  doc: vi.fn(() => "state-ref"), getDocFromServer: vi.fn(), onSnapshot: vi.fn(), runTransaction: vi.fn(),
}));
vi.mock("firebase/firestore", () => firestore);
import { firebaseClients } from "../../src/lib/firebase/client";
import { readCloud, watchCloud, writeCloud } from "../../src/modules/tracking/data/cloud";

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

it("rejects offline cloud reads/writes immediately without queueing or claiming success", async () => {
  vi.stubGlobal("navigator", { onLine: false });
  await expect(readCloud("owner")).rejects.toThrow("cần mạng");
  await expect(writeCloud("owner", emptyState(), 0)).rejects.toThrow("chưa được lưu");
  expect(firebaseClients).not.toHaveBeenCalled();
});

it("reads from the server and only reacts to server-confirmed snapshots", async () => {
  vi.mocked(firebaseClients).mockReturnValue({ db: {} } as ReturnType<typeof firebaseClients>);
  firestore.getDocFromServer.mockResolvedValue({ exists: () => true, data: emptyState });
  expect(await readCloud("owner")).toEqual(emptyState());
  expect(firestore.getDocFromServer).toHaveBeenCalledWith("state-ref");
  const changed = vi.fn(), failed = vi.fn();
  watchCloud("owner", changed, failed);
  const snapshot = firestore.onSnapshot.mock.calls[0][2];
  snapshot({ metadata: { fromCache: true, hasPendingWrites: false } });
  snapshot({ metadata: { fromCache: false, hasPendingWrites: true } });
  expect(changed).not.toHaveBeenCalled();
  snapshot({ metadata: { fromCache: false, hasPendingWrites: false } });
  expect(changed).toHaveBeenCalledOnce();
});

it("waits for transaction acknowledgement and refuses a concurrent server edit", async () => {
  vi.mocked(firebaseClients).mockReturnValue({ db: {}, auth: { currentUser: { uid: "owner" } } } as ReturnType<typeof firebaseClients>);
  let acknowledge!: () => void;
  const transaction = { get: vi.fn(async () => ({ exists: () => true, data: () => ({ version: 3 }) })), set: vi.fn() };
  firestore.runTransaction.mockImplementation(async (_, operation) => {
    await operation(transaction);
    await new Promise<void>((resolve) => { acknowledge = resolve; });
  });
  let resolved = false;
  const task = writeCloud("owner", emptyState(), 3).then((state) => { resolved = true; return state; });
  await vi.waitFor(() => expect(transaction.set).toHaveBeenCalled());
  expect(resolved).toBe(false);
  acknowledge();
  expect((await task).version).toBe(4);
  transaction.set.mockClear();
  await expect(writeCloud("owner", emptyState(), 2)).rejects.toThrow("thiết bị khác");
  expect(transaction.set).not.toHaveBeenCalled();
});
