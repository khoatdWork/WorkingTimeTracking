import { doc, getDocFromServer, onSnapshot, runTransaction } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { firebaseClients } from "@/lib/firebase/client";
import { emptyState, validateState, type TrackerState } from "../core/domain";
function stateRef(uid: string) {
  return doc(firebaseClients().db, "users", uid, "tracker", "state");
}
export async function readCloud(uid: string): Promise<TrackerState> {
  if (globalThis.navigator?.onLine === false)
    throw new Error("Sổ Firebase cần mạng để mở. Hãy kết nối rồi tải lại.");
  const result = await getDocFromServer(stateRef(uid));
  return result.exists() ? validateState(result.data()) : emptyState();
}
export function watchCloud(uid: string, changed: () => void, failed: (error: Error) => void) {
  return onSnapshot(stateRef(uid), { includeMetadataChanges: true }, (snapshot) => {
    if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) changed();
  }, failed);
}
export async function writeCloud(
  uid: string,
  next: TrackerState,
  expectedVersion: number,
): Promise<TrackerState> {
  if (globalThis.navigator?.onLine === false)
    throw new Error("Đang mất mạng. Thao tác chưa được lưu lên Firebase. Hãy kết nối rồi thử lại.");
  const { db, auth } = firebaseClients();
  if (auth.currentUser?.uid !== uid)
    throw new Error("Phiên đăng nhập đã thay đổi. Hãy đăng nhập lại.");
  const saved = validateState({ ...next, version: expectedVersion + 1 });
  try {
    await runTransaction(db, async (transaction) => {
      const ref = stateRef(uid),
        current = await transaction.get(ref);
      if ((current.exists() ? current.data().version : 0) !== expectedVersion)
        throw new Error(
          "Dữ liệu đã đổi trên thiết bị khác. Hãy tải lại trước khi lưu.",
        );
      transaction.set(ref, saved);
    });
  } catch (error) {
    if (error instanceof FirebaseError)
      throw new Error(
        "Chưa lưu được lên tài khoản. Hãy kiểm tra mạng và quyền truy cập, sau đó thử lại. Dữ liệu đã lưu trước đó vẫn được giữ.",
      );
    throw error;
  }
  return saved;
}
