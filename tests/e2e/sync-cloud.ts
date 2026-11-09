import type { TrackerState } from "../../src/modules/tracking/core/domain";
export async function readCloud(uid: string): Promise<TrackerState> {
  if (!navigator.onLine) throw new Error("offline");
  const response = await fetch(`/fixture-cloud/${uid}`);
  if (!response.ok) throw new Error("Firebase unavailable");
  return response.json();
}
export async function writeCloud(uid: string, state: TrackerState, version: number): Promise<TrackerState> {
  if (!navigator.onLine) throw new Error("offline");
  const response = await fetch(`/fixture-cloud/${uid}`, {
    method: "POST", body: JSON.stringify({ ...state, version: version + 1 }),
  });
  if (!response.ok) throw new Error("Firebase write rejected");
  return response.json();
}
export function watchCloud(_uid: string, changed: () => void) {
  window.addEventListener("fixture-remote", changed);
  return () => window.removeEventListener("fixture-remote", changed);
}
