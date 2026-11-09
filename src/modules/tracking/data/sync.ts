import { readCloud, writeCloud } from "./cloud";
import { readBackup, storeBackup, withLocalLock, type LocalBackup } from "./repository";

export async function syncBackup(uid: string, active: () => boolean): Promise<LocalBackup | null> {
  const local = readBackup(uid);
  if (!local || !active()) return null;
  const remote = await readCloud(uid);
  if (!active()) return null;
  let confirmed = remote;
  if (local.dirty) {
    confirmed = await writeCloud(uid, local.state, remote.version);
  }
  return withLocalLock(() => {
    if (!active()) return null;
    const current = readBackup(uid);
    if (!current) return null;
    const edited = current.state.version !== local.state.version;
    // A local edit during a cloud pull must keep the version it was based on.
    if (edited && !local.dirty) return current;
    const changed = !local.dirty && current.cloudVersion !== confirmed.version;
    const backup: LocalBackup = {
      state: changed
        ? { ...confirmed, version: current.state.version + 1 }
        : current.state,
      cloudVersion: confirmed.version,
      dirty: edited,
    };
    storeBackup(uid, backup);
    return backup;
  });
}
