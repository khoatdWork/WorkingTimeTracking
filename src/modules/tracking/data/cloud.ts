import { doc, getDoc, runTransaction } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { firebaseClients } from "@/lib/firebase/client";
import { emptyState, validateState, type TrackerState } from "../core/domain";
function stateRef(uid: string) {
  return doc(firebaseClients().db, "users", uid, "tracker", "state");
}
export async function readCloud(uid: string): Promise<TrackerState> {
  const result = await getDoc(stateRef(uid));
  return result.exists() ? validateState(result.data()) : emptyState();
}
export async function writeCloud(
  uid: string,
  next: TrackerState,
  expectedVersion: number,
): Promise<TrackerState> {
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
