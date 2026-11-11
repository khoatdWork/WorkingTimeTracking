"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MonthPicker } from "@/modules/tracking/month-picker";
import {
  addDays,
  addTimeOff,
  dateLabel,
  removeTimeOff,
  type TrackerState,
} from "@/modules/tracking/core/domain";

export function TimeOffPlanner({
  kind,
  state,
  today,
  month,
  setMonth,
  busy,
  save,
  edit,
  onDirtyChange,
}: {
  kind: "leave" | "holiday";
  state: TrackerState;
  today: string;
  month: string;
  setMonth: (month: string) => void;
  busy: boolean;
  save: (change: (current: TrackerState) => TrackerState) => Promise<TrackerState>;
  edit: (date: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const isLeave = kind === "leave";
  const title = isLeave ? "Nghỉ phép" : "Ngày nghỉ lễ";
  const label = isLeave ? "ngày nghỉ phép" : "ngày nghỉ lễ";
  const rowLabel = isLeave ? "ngày nghỉ phép" : "ngày lễ";
  const firstDate = isLeave && today < "2100-12-31" ? addDays(today, 1) : today;
  const [fromDate, setFromDate] = useState(firstDate);
  const [toDate, setToDate] = useState(firstDate);
  const [formOpen, setFormOpen] = useState(!isLeave);
  const [name, setName] = useState("");
  const [baseline, setBaseline] = useState({ fromDate: firstDate, toDate: firstDate, name: "" });
  const dirty = formOpen && (fromDate !== baseline.fromDate || toDate !== baseline.toDate || name !== baseline.name);
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!onDirtyChange) return;
    const unload = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [dirty, onDirtyChange]);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const [removing, setRemoving] = useState<{ date: string; version: number } | null>(null);
  const days = Object.values(state.days)
    .filter((day) => day.kind === kind && day.date.startsWith(`${month}-`))
    .sort((a, b) => a.date.localeCompare(b.date));
  const existingDate = Object.keys(state.days).sort()
    .find((date) => date >= fromDate && date <= toDate);

  return (
    <section className="panel form-stack" aria-labelledby={`${kind}-heading`}>
      <div className="section-heading">
        <h2 id={`${kind}-heading`}>{title}</h2>
        <CalendarDays size={18} aria-hidden="true" />
      </div>
      <p className="help">
        {isLeave
          ? "Đánh dấu trước ngày nghỉ phép. Ngày nghỉ không cộng giờ đã làm và được loại khỏi chỉ tiêu tuần, tháng."
          : "Chọn khoảng nghỉ, tính cả ngày bắt đầu và kết thúc. Nếu chỉ nghỉ một ngày, chọn hai ngày giống nhau. Chỉ tiêu tuần và tháng tự cập nhật; cuối tuần không giảm thêm chỉ tiêu."}
      </p>
      {isLeave && !formOpen && <Button disabled={busy} onClick={() => {
        setFromDate(firstDate);
        setToDate(firstDate);
        setName("");
        setError("");
        setBaseline({ fromDate: firstDate, toDate: firstDate, name: "" });
        setFormOpen(true);
      }}>
        <Plus size={17} aria-hidden="true" />Thêm ngày nghỉ phép
      </Button>}
      {formOpen && <form className="form-stack" onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        try {
          await save((current) => addTimeOff(current, kind, fromDate, toDate, name.trim()));
          setMonth(fromDate.slice(0, 7));
          setName("");
          setBaseline({ fromDate, toDate, name: "" });
          if (isLeave) setFormOpen(false);
          toast.success(`Đã thêm ${label}`);
        } catch (e) {
          setError(e instanceof Error ? e.message : `Chưa lưu được ${label}. Hãy thử lại.`);
        }
      }}>
        {isLeave && <p className="help">Chọn cùng một ngày nếu nghỉ một ngày. Khoảng nghỉ tính cả hai đầu; cuối tuần không giảm thêm chỉ tiêu.</p>}
        <div>
          <Label htmlFor={`${kind}-from`}>Từ ngày</Label>
          <Input id={`${kind}-from`} name={`${kind}-from`} autoComplete="off" type="date" min="2000-01-01" max="2100-12-31" disabled={busy}
            required value={fromDate} onChange={(event) => {
              const value = event.target.value;
              setFromDate(value);
              if (value > toDate) setToDate(value);
              setError("");
            }} />
        </div>
        <div>
          <Label htmlFor={`${kind}-to`}>Đến ngày</Label>
          <Input id={`${kind}-to`} name={`${kind}-to`} autoComplete="off" type="date" min={fromDate || "2000-01-01"} max="2100-12-31" disabled={busy}
            required value={toDate} onChange={(event) => { setToDate(event.target.value); setError(""); }} />
        </div>
        <div>
          <Label htmlFor={`${kind}-name`}>{isLeave ? "Ghi chú (không bắt buộc)" : "Tên ngày lễ (không bắt buộc)"}</Label>
          <Input id={`${kind}-name`} name={`${kind}-name`} autoComplete="off" maxLength={1000} placeholder={isLeave ? "Ví dụ: nghỉ việc cá nhân…" : "Ví dụ: Quốc khánh…"} disabled={busy}
            value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          <Plus size={17} aria-hidden="true" />
          {busy ? "Đang lưu…" : isLeave ? "Lưu ngày nghỉ phép" : "Thêm ngày nghỉ lễ"}
        </Button>
        {isLeave && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setFormOpen(false); setError(""); }}>Hủy</Button>}
        {existingDate && (
          <p className="help">
            Ngày {dateLabel(existingDate, { day: "2-digit", month: "2-digit", year: "numeric" })} đã có dữ liệu.
            Mở lại để xem hoặc chuyển loại ngày trước khi thêm khoảng nghỉ.
            <Button type="button" variant="link" disabled={busy} onClick={() => edit(existingDate)}>
              Chỉnh sửa ngày đã chọn
            </Button>
          </p>
        )}
      </form>}
      {error && <p className="form-error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
      <div className="holiday-list">
        <MonthPicker month={month} setMonth={setMonth} />
        {!days.length ? (
          <p className="help">Tháng này chưa có {label}. {isLeave ? "Bấm Thêm ngày nghỉ phép để lên lịch." : "Chọn ngày ở trên để thêm."}</p>
        ) : (
          <ul aria-label={`${title} trong tháng`}>
            {days.map((day) => (
              <li className="holiday-row" key={day.date}>
                <Button variant="ghost" className="holiday-edit" disabled={busy}
                  aria-label={`Sửa ${rowLabel} ${day.date.split("-").reverse().join("/")}`}
                  onClick={() => edit(day.date)}>
                  <time dateTime={day.date}>
                    {dateLabel(day.date, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </time>
                  <strong>{day.note || title}</strong>
                </Button>
                <Button variant="ghost" size="icon" disabled={busy}
                  aria-label={`Xóa ${rowLabel} ${day.date.split("-").reverse().join("/")}`}
                  onClick={() => { setError(""); setRemoving({ date: day.date, version: state.version }); }}>
                  <Trash2 size={17} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <AlertDialog open={!!removing} onOpenChange={(open) => { if (!open) setRemoving(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Ngày {removing?.date.split("-").reverse().join("/")} và ghi chú {label} sẽ bị xóa.
              Nếu là ngày thường, chỉ tiêu giờ làm sẽ trở lại và tổng tuần, tháng sẽ được tính lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={async () => {
              if (!removing) return;
              try {
                await save((current) => {
                  if (current.version !== removing.version)
                    throw new Error(`Sổ đã đổi. Hãy kiểm tra lại ${label} trước khi xóa.`);
                  return removeTimeOff(current, kind, removing.date);
                });
                toast.success(`Đã xóa ${label}`);
              } catch (e) {
                setError(e instanceof Error ? e.message : `Chưa xóa được ${label}. Hãy thử lại.`);
              }
            }}>
              Xóa {rowLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
