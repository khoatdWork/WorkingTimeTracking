import { afterEach, expect, it, vi } from "vitest";
import { emptyState } from "../../src/modules/tracking/core/domain";

vi.mock("@/lib/firebase/client", () => ({ firebaseClients: vi.fn() }));
import { firebaseClients } from "../../src/lib/firebase/client";
import { readCloud, writeCloud } from "../../src/modules/tracking/data/cloud";

afterEach(() => vi.unstubAllGlobals());

it("rejects offline cloud reads/writes immediately without queueing or claiming success", async () => {
  vi.stubGlobal("navigator", { onLine: false });
  await expect(readCloud("owner")).rejects.toThrow("cần mạng");
  await expect(writeCloud("owner", emptyState(), 0)).rejects.toThrow("chưa được lưu");
  expect(firebaseClients).not.toHaveBeenCalled();
});
