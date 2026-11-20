import { collection, doc, getDocFromServer, getDocsFromServer, limit, onSnapshot, orderBy, query, runTransaction } from "firebase/firestore";
import { sameContent } from "./merge";
import { FirebaseError } from "firebase/app";
import { firebaseClients } from "@/lib/firebase/client";
import { validateState, type TrackerState } from "../core/domain";
function stateRef(uid: string) {
  return doc(firebaseClients().db, "users", uid, "tracker", "state");
}
export async function readCloud(uid: string): Promise<TrackerState | null> {
  if (globalThis.navigator?.onLine === false)
    throw new Error("Sổ Firebase cần mạng để mở. Hãy kết nối rồi tải lại.");
  const result = await getDocFromServer(stateRef(uid));
  return result.exists() ? validateState(result.data()) : null;
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
      if (auth.currentUser?.uid !== uid) throw new Error("Phiên đăng nhập đã thay đổi. Chưa ghi sổ.");
      const ref = stateRef(uid),
        current = await transaction.get(ref);
      if ((current.exists() ? current.data().version : 0) !== expectedVersion)
        throw new Error(
          "Dữ liệu đã đổi trên thiết bị khác. Hãy tải lại trước khi lưu.",
        );
      // The previous server version is immutable and committed with its replacement.
      // shortcut: full ledger snapshots; split history by month before nearing the storage quota.
      if (current.exists()) {
        const history = doc(db, "users", uid, "trackerHistory", String(expectedVersion));
        const prior = await transaction.get(history);
        if (prior.exists() && !sameContent(validateState(prior.data()), validateState(current.data())))
          throw new Error("Bản lịch sử không khớp sổ tài khoản. Đã dừng ghi để giữ dữ liệu.");
        if (!prior.exists()) transaction.set(history, current.data());
      }
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
export async function readCloudHistory(uid: string): Promise<TrackerState[]> {
  const { auth, db } = firebaseClients();
  if (auth.currentUser?.uid !== uid) throw new Error("Hãy đăng nhập đúng tài khoản để đọc lịch sử.");
  const snapshots = await getDocsFromServer(query(collection(db, "users", uid, "trackerHistory"), orderBy("version", "desc"), limit(10)));
  return snapshots.docs.map(snapshot => validateState(snapshot.data()));
}
