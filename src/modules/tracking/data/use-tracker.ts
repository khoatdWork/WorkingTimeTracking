"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseClients, firebaseConfigured } from "@/lib/firebase/client";
import { localKey, openLocal, readBackup, withLocalLock, writeLocal } from "./repository";
import { watchCloud } from "./cloud";
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
  const owner = useRef<string | null>(null),
    writing = useRef(false),
    generation = useRef(0),
    syncingOwner = useRef<{ uid: string; ticket: number; requested: boolean } | null>(null);
  const sync = useCallback(async function synchronize() {
    const uid = owner.current;
    const ticket = generation.current;
    if (!uid || navigator.onLine === false) return;
    if (syncingOwner.current?.uid === uid && syncingOwner.current.ticket === ticket) {
      syncingOwner.current.requested = true;
      return;
    }
    const active = () => owner.current === uid && generation.current === ticket;
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
        again = backup.dirty;
      }
    } catch (e) {
      if (active()) setSyncError(e instanceof Error ? e.message : "Chưa đồng bộ được Firebase. Bản local vẫn được giữ.");
    } finally {
      if (syncingOwner.current === operation) syncingOwner.current = null;
      if (active()) {
        setSyncing(false);
        if (again || operation.requested) void synchronize();
      }
    }
  }, []);
  const load = useCallback(async (uid: string | null) => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    setSyncError("");
    setSyncing(false);
    setState(null);
    try {
      const backup = await withLocalLock(() =>
        generation.current === ticket && owner.current === uid ? openLocal(uid) : null);
      if (generation.current === ticket && backup) {
        setState(backup.state);
        setPending(backup.dirty || backup.cloudVersion === null);
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
    const stopAuth = firebaseConfigured ? onAuthStateChanged(
      firebaseClients().auth,
      (next) => {
        stopCloud();
        owner.current = next?.uid ?? null;
        setUser(next);
        void load(next?.uid ?? null).then(() => {
          if (!disposed && next && owner.current === next.uid)
            stopCloud = watchCloud(next.uid, () => void sync(), (e) => {
              if (owner.current === next.uid) setSyncError(e.message);
            });
        });
      },
      () => {
        owner.current = null;
        setUser(null);
        void load(null);
      },
    ) : (() => {
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
    if (!state || loading) throw new Error("Sổ chấm công chưa sẵn sàng. Hãy tải lại.");
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
  }, [state, loading, sync]);
  return { state, user, loading, busy, error, syncError, syncing, pending, save, retrySync: sync, reload: () => load(owner.current) };
}
