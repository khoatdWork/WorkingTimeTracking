import { emptyState, type TrackerState } from "../core/domain";
import { readCloud, writeCloud } from "./cloud";
import { mergeStates, sameContent, SyncConflict } from "./merge";
import { preserveRevision, readBackup, storeBackup, withLocalLock, type LocalBackup } from "./repository";

export async function syncBackup(uid: string, active: () => boolean): Promise<LocalBackup | null> {
  const local = readBackup(uid);
  if (!local || !active()) return null;
  const remote = await readCloud(uid);
  if (!active()) return null;
  if (remote && local.dirty && !sameContent(local.state, remote))
    await withLocalLock(() => { if (active()) preserveRevision(uid, remote); });
  if (!active()) return null;
  if ((!remote && (local.cloudVersion ?? 0) > 0) ||
      (remote && remote.version < (local.cloudVersion ?? 0)))
    throw new SyncConflict(remote, "Sổ tài khoản bị thiếu hoặc lùi về bản cũ. Đã dừng đồng bộ, giữ nguyên dữ liệu trên thiết bị để phục hồi.");
  if (remote && local.base && remote.version === local.cloudVersion && !sameContent(remote, local.base))
    throw new SyncConflict(remote, "Sổ tài khoản đã đổi mà không có phiên bản mới. Đã giữ dữ liệu và dừng đồng bộ để đối chiếu.");
  const server = remote ?? emptyState();
  let confirmed = server, uploaded: TrackerState | null = null;
  if (local.dirty) {
    uploaded = server.version === (local.cloudVersion ?? 0) && (local.base || server.version === 0)
      ? local.state
      : mergeStates(local.state, server, local.base);
    confirmed = sameContent(uploaded, server) ? server : await writeCloud(uid, uploaded, server.version);
  }
  return withLocalLock(() => {
    if (!active()) return null;
    const current = readBackup(uid);
    if (!current) return null;
    const edited = current.state.version !== local.state.version;
    if (current.cloudVersion !== local.cloudVersion) return current;
    // Rebase edits made in flight so pulled/merged days cannot become accidental deletions.
    const content = edited
      ? mergeStates(current.state, confirmed, local.state)
      : confirmed;
    const backup: LocalBackup = {
      state: sameContent(content, current.state) ? current.state : { ...content, version: current.state.version + 1 },
      cloudVersion: confirmed.version,
      base: confirmed,
      dirty: edited,
    };
    storeBackup(uid, backup);
    return backup;
  });
}
