"use client";
import { useEffect, useState, useRef } from "react";
import {
  Clock3,
  CalendarDays,
  ChartNoAxesCombined,
  Settings2,
  Download,
  Upload,
  RefreshCw,
  Cloud,
  HardDrive,
  Timer,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Toaster } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTracker } from "@/modules/tracking/data/use-tracker";
import { download, exportCsv } from "@/modules/tracking/data/repository";
import { DayEditor } from "@/modules/tracking/day-editor";
import { AccountPanel } from "@/modules/auth/account-panel";
import { usePwa } from "@/modules/pwa/use-pwa";
import { PwaPanel } from "@/modules/pwa/pwa-panel";
import {
  dateKey,
  emptyState,
  validateState,
  type TrackerState,
} from "@/modules/tracking/core/domain";

import { Today } from "@/modules/tracking/overview";
import { History } from "@/modules/tracking/history";
import { Reports } from "@/modules/tracking/reports";
import { SettingsForm } from "@/modules/settings/settings-form";
import { HolidaySettings } from "@/modules/settings/holiday-settings";
type Screen = "today" | "history" | "reports" | "settings";
export function TrackerApp() {
  const pwa = usePwa();
  const { state, user, loading, busy, error, syncError, syncing, pending, save, retrySync, reload } = useTracker();
  const [now, setNow] = useState<number | null>(null),
    [screen, setScreen] = useState<Screen>("today");
  const [editor, setEditor] = useState<string | null>(null),
    [month, setMonth] = useState("");
  const [importState, setImportState] = useState<TrackerState | null>(null),
    [clear, setClear] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const today = now ? dateKey(now) : "";
  async function run(
    change: (current: TrackerState) => TrackerState,
    message: string,
  ) {
    try {
      await save(change);
      toast.success(message);
      return true;
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Chưa lưu được. Hãy kiểm tra kết nối và thử lại.",
      );
      return false;
    }
  }
  function navigate(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function edit(date: string) {
    setEditor(date);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const ready = state && now;
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Đến nội dung
      </a>
      <header className="app-header">
        <a
          className="brand"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`}
          aria-label="Đủ giờ, trang chủ"
        >
          <span className="brand-mark">
            <Clock3 size={22} strokeWidth={2.2} />
          </span>
          <span>
            đủ giờ<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="storage-label">
          {user ? <Cloud size={14} /> : <HardDrive size={14} />}
          {user ? "Local + Firebase" : "Trên thiết bị"}
        </span>
      </header>
      {!pwa.online && (
        <p className="connection-notice" role="status">
          Đang mất mạng. Dữ liệu vẫn lưu trên thiết bị và tự đồng bộ khi có mạng, đã đăng nhập Google.
        </p>
      )}
      {user && state && (
        <div className="connection-notice" role="status">
          {syncing ? "Đã giữ bản local · Đang đồng bộ Firebase…"
            : syncError ? `Bản local vẫn được giữ. ${syncError}`
            : pending ? "Đã lưu local · Chờ đồng bộ Firebase"
            : "Đã lưu local · Đã đồng bộ Firebase"}
          {syncError && <Button variant="ghost" onClick={retrySync} disabled={busy}>Thử đồng bộ lại</Button>}
        </div>
      )}
      {pwa.waiting && !editor && screen !== "settings" && (
        <div className="connection-notice update-notice" role="status">
          <span>Có phiên bản mới của Đủ giờ.</span>
          <Button variant="outline" disabled={busy} onClick={() => navigate("settings")}>
            Xem bản cập nhật
          </Button>
        </div>
      )}
      {editor && ready ? (
        <DayEditor
          key={editor}
          date={editor}
          state={state}
          save={save}
          close={() => setEditor(null)}
          busy={busy}
        />
      ) : (
        <main id="main-content" className="main-content">
          {loading || !now ? (
            <div className="loading-state" role="status">
              <Timer className="loading-icon" />
              <p>Đang mở sổ thời gian…</p>
            </div>
          ) : error || !state ? (
            <div className="panel error-state" role="alert">
              <AlertCircle />
              <h1>Chưa mở được sổ</h1>
              <p>{error}</p>
              <Button onClick={reload}>
                <RefreshCw />
                Tải lại
              </Button>
              {user && <AccountPanel user={user} busy={busy} />}
            </div>
          ) : (
            <>
              {screen === "today" && (
                <Today
                  state={state}
                  now={now}
                  busy={busy}
                  run={run}
                  edit={edit}
                />
              )}
              {screen === "history" && (
                <History
                  state={state}
                  now={now}
                  month={month || today.slice(0, 7)}
                  setMonth={setMonth}
                  edit={edit}
                />
              )}
              {screen === "reports" && (
                <Reports
                  state={state}
                  now={now}
                  month={month || today.slice(0, 7)}
                  setMonth={setMonth}
                  edit={edit}
                />
              )}
              {screen === "settings" && (
                <>
                  <div className="page-heading">
                    <h1>Cài đặt</h1>
                    <p className="subtitle">
                      Sổ thời gian theo cách bạn làm việc.
                    </p>
                  </div>
                  <HolidaySettings
                    state={state}
                    today={today}
                    month={month || today.slice(0, 7)}
                    setMonth={setMonth}
                    busy={busy}
                    save={save}
                    edit={edit}
                  />
                  <SettingsForm
                    key={state.version}
                    settings={state.settings}
                    busy={busy}
                    onSave={(settings) =>
                      run(
                        (current) => validateState({ ...current, settings }),
                        "Đã lưu cài đặt",
                      )
                    }
                  />
                  <AccountPanel user={user} busy={busy} />
                  <PwaPanel pwa={pwa} busy={busy} />
                  <section className="panel form-stack">
                    <div className="section-heading">
                      <h2>Bản sao lưu</h2>
                      <Download size={19} />
                    </div>
                    <p className="help">
                      Dữ liệu luôn có bản local trên thiết bị. Khi mở app, đăng nhập hoặc có mạng trở lại,
                      app tự đồng bộ với Firebase: tải về khi chưa có bản local, tải lên các thay đổi local chưa đồng bộ. {" "}
                      JSON giữ nguyên ca làm, trạng thái WFH và cài đặt. CSV
                      dùng để đối chiếu trên bảng tính. Giờ vào/về trong CSV là UTC; WFH cố định có cột số giờ riêng.
                    </p>
                    <div className="two-buttons">
                      <Button
                        variant="outline"
                        onClick={() =>
                          download(
                            `du-gio-${today}.json`,
                            JSON.stringify(state, null, 2),
                          )
                        }
                      >
                        <Download />
                        Xuất JSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          download(
                            `du-gio-${today}.csv`,
                            exportCsv(state, now),
                            "text/csv;charset=utf-8",
                          )
                        }
                      >
                        <Download />
                        Xuất CSV
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => fileInput.current?.click()}
                    >
                      <Upload />
                      Nhập bản sao lưu JSON
                    </Button>
                    <input
                      aria-label="Chọn bản sao lưu JSON"
                      type="file"
                      accept=".json,application/json"
                      hidden
                      ref={fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          if (file.size > 900000)
                            throw new Error("Tệp quá lớn. Giới hạn 900 KB.");
                          setImportState(
                            validateState(JSON.parse(await file.text())),
                          );
                        } catch (e) {
                          toast.error(
                            e instanceof Error
                              ? e.message
                              : "Không đọc được tệp JSON.",
                          );
                        }
                      }}
                    />
                    <Button variant="ghost" disabled={busy} onClick={reload}>
                      <RefreshCw />
                      Tải lại dữ liệu
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setClear(true)}
                    >
                      Xóa toàn bộ sổ hiện tại
                    </Button>
                  </section>
                  <p className="footnote">
                    Múi giờ Việt Nam (UTC+7). Thêm ngày lễ tại Cài đặt; nghỉ phép đánh dấu
                    trong Lịch sử. Trạng thái request do bạn tự ghi
                    nhận.
                  </p>
                </>
              )}
            </>
          )}
        </main>
      )}
      {!editor && (
        <nav className="bottom-nav" aria-label="Điều hướng chính">
          {(
            [
              { id: "today", label: "Hôm nay", icon: Clock3 },
              { id: "history", label: "Lịch sử", icon: CalendarDays },
              { id: "reports", label: "Báo cáo", icon: ChartNoAxesCombined },
              { id: "settings", label: "Cài đặt", icon: Settings2 },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              aria-current={screen === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={21} aria-hidden="true" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      )}
      <Toaster position="top-center" richColors />
      <AlertDialog
        open={!!importState || clear}
        onOpenChange={(open) => {
          if (!open) {
            setImportState(null);
            setClear(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clear ? "Xóa toàn bộ sổ hiện tại?" : "Thay sổ bằng bản sao lưu?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clear
                ? "Ca làm, WFH và ngày nghỉ trong sổ hiện tại sẽ bị xóa. Hãy xuất JSON trước nếu cần giữ dữ liệu."
                : `Bản sao lưu có ${Object.keys(importState?.days || {}).length} ngày. Thao tác này thay toàn bộ sổ trên thiết bị${user ? " và tự đồng bộ lên Firebase của tài khoản đang đăng nhập" : ""}. Hãy xuất sổ hiện tại trước khi tiếp tục.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async () => {
                const result = clear ? emptyState() : importState;
                if (result)
                  await run(
                    (current) => ({ ...result, version: current.version }),
                    clear ? "Đã xóa sổ hiện tại" : "Đã nhập bản sao lưu",
                  );
                setImportState(null);
                setClear(false);
              }}
            >
              {" "}
              {clear ? "Xóa toàn bộ" : "Thay sổ hiện tại"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
