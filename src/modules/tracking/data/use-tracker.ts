"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseClients, firebaseConfigured } from "@/lib/firebase/client";
import { readLocal, writeLocal } from "./repository";
import { readCloud, writeCloud } from "./cloud";
import { type TrackerState } from "../core/domain";

export function useTracker() {
  const [state, setState] = useState<TrackerState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owner = useRef<string | null>(null),
    writing = useRef(false),
    generation = useRef(0);
  const load = useCallback(async (uid: string | null, retain = false) => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    if (!retain) setState(null);
    try {
      const result = uid ? await readCloud(uid) : readLocal();
      if (generation.current === ticket) setState(result);
    } catch (error) {
      if (generation.current === ticket)
        setError(
          navigator.onLine === false && error instanceof Error
            ? error.message
            : "Không đọc được sổ chấm công. Hãy kiểm tra kết nối, quyền truy cập hoặc bản sao lưu, rồi tải lại.",
        );
    } finally {
      if (generation.current === ticket) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!firebaseConfigured) {
      const id = setTimeout(() => void load(null), 0);
      return () => clearTimeout(id);
    }
    return onAuthStateChanged(
      firebaseClients().auth,
      (next) => {
        owner.current = next?.uid ?? null;
        setUser(next);
        void load(next?.uid ?? null);
      },
      () => {
        setError("Không kiểm tra được đăng nhập. Hãy tải lại trang.");
        setLoading(false);
      },
    );
  }, [load]);
  useEffect(() => {
    const change = (event: StorageEvent) => {
      if (
        !owner.current &&
        event.key === "du-gio.tracker.v1" &&
        !writing.current
      )
        void load(null, true);
    };
    window.addEventListener("storage", change);
    return () => window.removeEventListener("storage", change);
  }, [load]);
  const save = useCallback(
    async (change: (current: TrackerState) => TrackerState) => {
      if (!state || loading)
        throw new Error("Sổ chấm công chưa sẵn sàng. Hãy tải lại.");
      if (writing.current)
        throw new Error("Đang lưu thao tác trước. Hãy chờ một chút.");
      writing.current = true;
      setBusy(true);
      const uid = owner.current,
        ticket = generation.current;
      try {
        const next = change(structuredClone(state));
        const commit = async () =>
          uid
            ? await writeCloud(uid, next, state.version)
            : writeLocal(next, state.version);
        const saved =
          !uid && navigator.locks
            ? await navigator.locks.request("du-gio-save", commit)
            : await commit();
        if (ticket === generation.current && uid === owner.current)
          setState(saved);
        else
          throw new Error(
            "Tài khoản đã thay đổi. Hãy kiểm tra lại sổ hiện tại.",
          );
        return saved;
      } finally {
        writing.current = false;
        setBusy(false);
      }
    },
    [state, loading],
  );
  return {
    state,
    user,
    loading,
    busy,
    error,
    save,
    reload: () => load(owner.current),
  };
}
