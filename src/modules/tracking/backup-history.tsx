"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { readCloudHistory } from "./data/cloud";
import { download, readRevisions } from "./data/repository";
import type { TrackerState } from "./core/domain";

export function BackupHistory({ uid }: { uid: string | null }) {
  const [cloud, setCloud] = useState<TrackerState[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const local = useMemo(() => {
    try { return { revisions: readRevisions(uid), error: "" }; }
    catch { return { revisions: [], error: "Chưa đọc được bản tự lưu. Các bản hiện có vẫn được giữ nguyên." }; }
  }, [uid]);
  const exportState = (state: TrackerState, label: string) =>
    download(`du-gio-phuc-hoi-${label}.json`, JSON.stringify(state, null, 2));
  return <section className="panel form-stack" aria-labelledby="recovery-title">
    <h2 id="recovery-title">Bản phục hồi tự động</h2>
    <p className="help">App giữ bản trước khi thay đổi sổ. Tải bản cần đối chiếu rồi dùng Nhập JSON để khôi phục sau khi kiểm tra.</p>
    {local.error && <p role="alert">{local.error}</p>}
    {local.revisions.map((revision, index) => <Button key={`${revision.at}-${index}`} variant="outline"
      onClick={() => exportState(revision.state, String(revision.at))}>
      {new Date(revision.at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · {Object.keys(revision.state.days).length} ngày
    </Button>)}
    {!local.revisions.length && !local.error && <p className="help">Chưa có bản trước đó trên thiết bị này.</p>}
    {uid && <Button variant="outline" disabled={loading} onClick={async () => {
      setLoading(true); setError("");
      try { setCloud(await readCloudHistory(uid)); setLoaded(true); }
      catch (e) { setError(e instanceof Error ? e.message : "Chưa đọc được lịch sử tài khoản."); }
      finally { setLoading(false); }
    }}>{loading ? "Đang đọc bản phục hồi…" : "Xem bản phục hồi trên tài khoản"}</Button>}
    {cloud.map(state => <Button key={state.version} variant="outline" onClick={() => exportState(state, `tai-khoan-${state.version}`)}>
      Bản tài khoản #{state.version} · {Object.keys(state.days).length} ngày
    </Button>)}
    {loaded && !cloud.length && <p className="help">Chưa có bản lịch sử trên tài khoản. Bản trước đó được giữ từ lần đồng bộ bằng phiên bản ứng dụng này.</p>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </section>;
}
