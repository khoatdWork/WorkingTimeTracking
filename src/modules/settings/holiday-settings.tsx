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
  addHolidays,
  dateLabel,
  removeHoliday,
  type TrackerState,
} from "@/modules/tracking/core/domain";

export function HolidaySettings({
  state,
  today,
  month,
  setMonth,
  busy,
  save,
  edit,
}: {
  state: TrackerState;
  today: string;
  month: string;
  setMonth: (month: string) => void;
  busy: boolean;
  save: (change: (current: TrackerState) => TrackerState) => Promise<TrackerState>;
  edit: (date: string) => void;
}) {
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const [removing, setRemoving] = useState<{ date: string; version: number } | null>(null);
  const holidays = Object.values(state.days)
    .filter((day) => day.kind === "holiday" && day.date.startsWith(`${month}-`))
    .sort((a, b) => a.date.localeCompare(b.date));
  const existingDate = Object.keys(state.days).sort()
    .find((date) => date >= fromDate && date <= toDate);

  return (
    <section className="panel form-stack" aria-labelledby="holiday-heading">
      <div className="section-heading">
        <h2 id="holiday-heading">Ngày nghỉ lễ</h2>
        <CalendarDays size={18} aria-hidden="true" />
      </div>
      <p className="help">
        Chọn khoảng nghỉ, tính cả ngày bắt đầu và kết thúc. Nếu chỉ nghỉ một ngày, chọn hai ngày giống nhau.
        Chỉ tiêu tuần và tháng tự cập nhật; cuối tuần không giảm thêm chỉ tiêu.
      </p>
      <form className="form-stack" onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        try {
          await save((current) => addHolidays(current, fromDate, toDate, name.trim()));
          setMonth(fromDate.slice(0, 7));
          setName("");
          toast.success("Đã thêm ngày nghỉ lễ");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Chưa lưu được ngày lễ. Hãy thử lại.");
        }
      }}>
        <div>
          <Label htmlFor="holiday-from">Từ ngày</Label>
          <Input id="holiday-from" name="holiday-from" autoComplete="off" type="date" min="2000-01-01" max="2100-12-31" disabled={busy}
            required value={fromDate} onChange={(event) => {
              const value = event.target.value;
              setFromDate(value);
              if (value > toDate) setToDate(value);
              setError("");
            }} />
        </div>
        <div>
          <Label htmlFor="holiday-to">Đến ngày</Label>
          <Input id="holiday-to" name="holiday-to" autoComplete="off" type="date" min={fromDate || "2000-01-01"} max="2100-12-31" disabled={busy}
            required value={toDate} onChange={(event) => { setToDate(event.target.value); setError(""); }} />
        </div>
        <div>
          <Label htmlFor="holiday-name">Tên ngày lễ (không bắt buộc)</Label>
          <Input id="holiday-name" name="holiday-name" autoComplete="off" maxLength={1000} placeholder="Ví dụ: Quốc khánh…" disabled={busy}
            value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          <Plus size={17} aria-hidden="true" />
          {busy ? "Đang lưu…" : "Thêm ngày nghỉ lễ"}
        </Button>
        {existingDate && (
          <p className="help">
            Ngày {dateLabel(existingDate, { day: "2-digit", month: "2-digit", year: "numeric" })} đã có dữ liệu.
            Mở lại để xem hoặc chuyển loại ngày trước khi thêm khoảng nghỉ.
            <Button type="button" variant="link" disabled={busy} onClick={() => edit(existingDate)}>
              Chỉnh sửa ngày đã chọn
            </Button>
          </p>
        )}
      </form>
      {error && <p className="form-error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
      <div className="holiday-list">
        <MonthPicker month={month} setMonth={setMonth} />
        {!holidays.length ? (
          <p className="help">Tháng này chưa có ngày nghỉ lễ. Chọn ngày ở trên để thêm.</p>
        ) : (
          <ul aria-label="Ngày nghỉ lễ trong tháng">
            {holidays.map((day) => (
              <li className="holiday-row" key={day.date}>
                <Button variant="ghost" className="holiday-edit" disabled={busy}
                  aria-label={`Sửa ngày lễ ${day.date.split("-").reverse().join("/")}`}
                  onClick={() => edit(day.date)}>
                  <time dateTime={day.date}>
                    {dateLabel(day.date, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                  </time>
                  <strong>{day.note || "Ngày nghỉ lễ"}</strong>
                </Button>
                <Button variant="ghost" size="icon" disabled={busy}
                  aria-label={`Xóa ngày lễ ${day.date.split("-").reverse().join("/")}`}
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
            <AlertDialogTitle>Xóa ngày nghỉ lễ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ngày {removing?.date.split("-").reverse().join("/")} và ghi chú ngày lễ sẽ bị xóa.
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
                    throw new Error("Sổ đã đổi. Hãy kiểm tra lại ngày lễ trước khi xóa.");
                  return removeHoliday(current, removing.date);
                });
                toast.success("Đã xóa ngày nghỉ lễ");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Chưa xóa được ngày lễ. Hãy thử lại.");
              }
            }}>
              Xóa ngày lễ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
