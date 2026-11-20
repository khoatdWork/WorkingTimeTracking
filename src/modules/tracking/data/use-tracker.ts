"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseClients, firebaseConfigured } from "@/lib/firebase/client";
import { localKey, openLocal, readAccount, readBackup, rememberAccount, storeBackup, withLocalLock, writeLocal, type SavedAccount } from "./repository";
import { readCloud, watchCloud } from "./cloud";
import { sameContent, SyncConflict } from "./merge";
import { syncBackup } from "./sync";
import { type TrackerState } from "../core/domain";

export function useTracker() {
  const [state, setState] = useState<TrackerState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(false);
  const [account, setAccount] = useState<SavedAccount | null>(null);
  const [conflict, setConflict] = useState<SyncConflict | null>(null);
  const [cloudVersion, setCloudVersion] = useState<number | null>(null);
  const authenticated = useRef<string | null>(null);
  const owner = useRef<string | null>(null),
    writing = useRef(false),
    generation = useRef(0),
    syncingOwner = useRef<{ uid: string; ticket: number; requested: boolean } | null>(null);
  const sync = useCallback(async function synchronize() {
    const uid = owner.current;
    const ticket = generation.current;
    if (!uid || authenticated.current !== uid || navigator.onLine === false) return;
    if (syncingOwner.current?.uid === uid && syncingOwner.current.ticket === ticket) {
      syncingOwner.current.requested = true;
      return;
    }
    const active = () => owner.current === uid && authenticated.current === uid && generation.current === ticket;
    const operation = { uid, ticket, requested: false };
    syncingOwner.current = operation;
    setSyncing(true);
    let again = false;
    try {
      await syncBackup(uid, active);
      const backup = active() ? readBackup(uid) : null;
      if (active() && backup) {
        setState(backup.state);
        setPending(backup.dirty);
        setSyncError("");
        setConflict(null);
        setCloudVersion(backup.cloudVersion);
        again = backup.dirty;
      }
    } catch (e) {
      if (active()) {
        setSyncError(e instanceof Error ? e.message : "Chưa đồng bộ được Firebase. Bản local vẫn được giữ.");
        setConflict(e instanceof SyncConflict ? e : null);
      }
    } finally {
      if (syncingOwner.current === operation) syncingOwner.current = null;
      if (active()) {
        setSyncing(false);
        if (again || operation.requested) void synchronize();
      }
    }
  }, []);
  const load = useCallback(async (uid: string | null, create = true) => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    setSyncError("");
    setSyncing(false);
    setConflict(null);
    setState(null);
    try {
      const backup = await withLocalLock(() => {
        if (generation.current !== ticket || owner.current !== uid) return null;
        const existing = readBackup(uid);
        if (!create && !existing) throw new Error("Chưa tìm thấy bản tài khoản trên thiết bị. Hãy đăng nhập lại để mở sổ Firebase; chưa tạo sổ thay thế.");
        return existing ?? openLocal(uid);
      });
      if (generation.current === ticket && backup) {
        setState(backup.state);
        setPending(backup.dirty || backup.cloudVersion === null);
        setCloudVersion(backup.cloudVersion);
      }
    } catch (e) {
      if (generation.current === ticket)
        setError(e instanceof Error ? e.message : "Không đọc được bản local. Hãy kiểm tra bản sao lưu rồi tải lại.");
    } finally {
      if (generation.current === ticket) {
        setLoading(false);
        void sync();
      }
    }
  }, [sync]);
  useEffect(() => {
    let disposed = false;
    const invalidate = () => { ++generation.current; };
    let stopCloud = () => {};
    const authFailed = (e: Error) => {
      if (disposed) return;
      ++generation.current;
      stopCloud();
      authenticated.current = null;
      setUser(null);
      setLoading(false);
      setSyncing(false);
      setError(`Không khôi phục được phiên Google. Chưa chuyển sang sổ khác. ${e.message}`);
    };
    const stopAuth = firebaseConfigured ? (() => {
      try { return onAuthStateChanged(
      firebaseClients().auth,
      (next) => {
        stopCloud();
        authenticated.current = next?.uid ?? null;
        setUser(next);
        let savedAccount: SavedAccount | null;
        try {
          savedAccount = next ? { uid: next.uid, label: next.email || next.displayName || "Tài khoản Google" } : readAccount();
          if (next) rememberAccount(savedAccount);
        } catch (e) {
          ++generation.current;
          setLoading(false);
          setError(e instanceof Error ? e.message : "Không đọc được tài khoản đã dùng.");
          return;
        }
        setAccount(savedAccount);
        owner.current = savedAccount?.uid ?? null;
        void load(owner.current, !!next || !savedAccount).then(() => {
          if (!disposed && next && owner.current === next.uid)
            stopCloud = watchCloud(next.uid, () => void sync(), (e) => {
              if (owner.current === next.uid && authenticated.current === next.uid) setSyncError(e.message);
            });
        });
      },
      authFailed,
      ); } catch (e) {
        const id = setTimeout(() => authFailed(e instanceof Error ? e : new Error("Chưa mở được Firebase Auth.")), 0);
        return () => clearTimeout(id);
      }
    })() : (() => {
      const id = setTimeout(() => void load(null), 0);
      return () => clearTimeout(id);
    })();
    return () => {
      disposed = true;
      stopAuth();
      stopCloud();
      invalidate();
    };
  }, [load, sync]);
  useEffect(() => {
    const change = (event: StorageEvent) => {
      if (event.key !== localKey(owner.current) || writing.current) return;
      try {
        const backup = readBackup(owner.current);
        if (backup) {
          setState(backup.state);
          setPending(backup.dirty);
          void sync();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không đọc được bản local.");
      }
    };
    const resume = () => void sync();
    const visible = () => { if (document.visibilityState === "visible") resume(); };
    window.addEventListener("storage", change);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("storage", change);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [sync]);
  const save = useCallback(async (change: (current: TrackerState) => TrackerState) => {
    if (!state || loading || error) throw new Error("Sổ chấm công chưa sẵn sàng. Hãy kiểm tra tài khoản và tải lại.");
    if (writing.current) throw new Error("Đang lưu thao tác trước. Hãy chờ một chút.");
    writing.current = true;
    setBusy(true);
    const uid = owner.current, ticket = generation.current;
    try {
      const next = change(structuredClone(state));
      const saved = await withLocalLock(() => {
        if (ticket !== generation.current || uid !== owner.current)
          throw new Error("Tài khoản đã thay đổi. Hãy kiểm tra lại sổ hiện tại.");
        return writeLocal(next, state.version, uid);
      });
      if (ticket !== generation.current || uid !== owner.current)
        throw new Error("Tài khoản đã thay đổi. Bản local đã lưu được giữ riêng cho tài khoản trước.");
      setState(saved);
      setPending(true);
      void sync();
      return saved;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }, [state, loading, error, sync]);
  const logout = async () => {
    const previous = readAccount();
    rememberAccount(null);
    try { await signOut(firebaseClients().auth); }
    catch (e) { rememberAccount(previous); throw e; }
  };
  const resolveConflict = async (useRemote: boolean) => {
    if (!conflict || !state || !owner.current || !user) throw new Error("Hãy đăng nhập và kiểm tra lại hai bản trước khi chọn.");
    const uid = owner.current, ticket = generation.current, expected = state.version;
    const remote = await readCloud(uid);
    if (remote?.version !== conflict.remote?.version || (remote && conflict.remote && !sameContent(remote, conflict.remote)))
      throw new Error("Sổ Firebase vừa thay đổi. Hãy thử đồng bộ lại để đối chiếu bản mới.");
    if (!remote) throw new Error("Không tìm thấy sổ Firebase. Hãy xuất bản thiết bị và dùng lịch sử phục hồi để kiểm tra.");
    const backup = await withLocalLock(() => {
      if (ticket !== generation.current || uid !== owner.current || authenticated.current !== uid)
        throw new Error("Tài khoản đã thay đổi. Chưa thay sổ.");
      const current = readBackup(uid);
      if (!current || current.state.version !== expected) throw new Error("Bản thiết bị vừa đổi. Hãy đối chiếu lại trước khi chọn.");
      const next = { state: { ...(useRemote ? remote : current.state), version: expected + 1 }, base: remote, cloudVersion: remote.version, dirty: !useRemote };
      storeBackup(uid, next);
      return next;
    });
    if (ticket !== generation.current || uid !== owner.current || authenticated.current !== uid)
      throw new Error("Tài khoản đã thay đổi. Bản vừa lưu được giữ riêng cho tài khoản trước.");
    setState(backup.state);
    setPending(backup.dirty);
    setCloudVersion(backup.cloudVersion);
    setConflict(null);
    setSyncError("");
    void sync();
  };
  return { state, user, account, loading, busy, error, syncError, syncing, pending, conflict, cloudVersion, save, logout, resolveConflict, retrySync: sync, reload: () => load(owner.current, !!authenticated.current || !owner.current) };
}
