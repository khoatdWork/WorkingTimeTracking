"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  dayStart,
  dateKey,
  newDay,
  validateState,
  type WorkDay,
  type TrackerState,
} from "./core/domain";

function localValue(timestamp: number) {
  return new Date(timestamp + 7 * 3600000).toISOString().slice(0, 19);
}
function toTimestamp(value: string) {
  return Date.parse(`${value}+07:00`);
}
export function DayEditor({
  date,
  state,
  save,
  close,
  busy,
}: {
  date: string;
  state: TrackerState;
  save: (change: (s: TrackerState) => TrackerState) => Promise<TrackerState>;
  close: () => void;
  busy: boolean;
}) {
  const existing = state.days[date];
  const [baseVersion] = useState(state.version);
  const [day, setDay] = useState<WorkDay>(() =>
    structuredClone(existing ?? newDay(date)),
  );
  const [sessions, setSessions] = useState(() =>
    (existing?.sessions ?? []).map((s) => ({
      start: localValue(s.start),
      end: s.end === null ? "" : localValue(s.end),
    })),
  );
  const [error, setError] = useState(""),
    [confirm, setConfirm] = useState<"delete" | "leave" | "replace" | null>(null),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [dirty]);
  function patch(change: Partial<WorkDay>) {
    setDay({ ...day, ...change });
    setDirty(true);
  }
  async function saveDay() {
    setError("");
    try {
      const result: WorkDay = {
        ...day,
        sessions: [],
      };
      if (day.kind === "work" && day.mode === "office")
        result.sessions = sessions.map((s) => ({
          start: toTimestamp(s.start),
          end: s.end ? toTimestamp(s.end) : null,
        }));
      if (day.kind === "work" && day.mode === "wfh" && day.wfhHours === undefined && existing?.mode === "wfh")
        result.sessions = existing.sessions;
      if (result.mode !== "wfh" || result.kind !== "work") delete result.wfhHours;
      if (result.kind === "work" && result.mode === "wfh" && result.wfhHours === undefined &&
          !result.sessions.length && date <= dateKey())
        throw new Error("Hãy chọn 8 hoặc 10 giờ làm WFH trước khi lưu.");
      await save((current) => {
        if (current.version !== baseVersion)
          throw new Error(
            "Sổ đã đổi ở tab khác. Giữ lại nội dung đang nhập, quay lại rồi mở ngày này để đối chiếu trước khi lưu.",
          );
        return validateState({
          ...current,
          days: { ...current.days, [date]: result },
        });
      });
      setDirty(false);
      close();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Chưa lưu được. Hãy kiểm tra kết nối rồi thử lại.",
      );
    }
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const replacingSessions = existing?.sessions.length && day.kind === "work" && day.mode === "wfh" && day.wfhHours !== undefined;
    const removingWfhHours = existing?.wfhHours !== undefined && (day.mode !== "wfh" || day.kind !== "work");
    const removingSessions = existing?.sessions.length && day.kind !== "work";
    if (replacingSessions || removingWfhHours || removingSessions) setConfirm("replace");
    else void saveDay();
  }
  return (
    <main id="main-content" className="editor main-content">
      <Button
        variant="ghost"
        className="back-button"
        disabled={busy}
        onClick={() => (dirty ? setConfirm("leave") : close())}
      >
        <ArrowLeft />
        Quay lại
      </Button>
      <h1>{existing ? "Chỉnh sửa ngày làm việc" : "Bổ sung ngày làm việc"}</h1>
      <p className="subtitle">
        {date.split("-").reverse().join("/")} · Giờ Việt Nam
      </p>
      <form onSubmit={submit} className="panel form-stack">
        <div>
          <Label htmlFor="edit-date">Ngày</Label>
          <Input id="edit-date" type="date" value={date} disabled />
        </div>
        <fieldset>
          <legend>Loại ngày</legend>
          <div className="segmented three">
            {(
              [
                ["work", "Làm việc"],
                ["leave", "Nghỉ phép"],
                ["holiday", "Ngày lễ"],
              ] as const
            ).map(([value, text]) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                aria-pressed={day.kind === value}
                onClick={() => patch({ kind: value })}
              >
                {text}
              </Button>
            ))}
          </div>
        </fieldset>
        {day.kind === "work" ? (
          <>
            <fieldset>
              <legend>Nơi làm việc</legend>
              <div className="segmented">
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={day.mode === "office"}
                  onClick={() => patch({ mode: "office" })}
                >
                  Văn phòng
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={day.mode === "wfh"}
                  onClick={() => patch({ mode: "wfh" })}
                >
                  Work from home
                </Button>
              </div>
            </fieldset>
            {day.mode === "wfh" && (
              <fieldset>
                <legend>Giờ làm WFH</legend>
                <div className="segmented">
                  {([8, 10] as const).map((hours) => (
                    <Button key={hours} type="button" variant="ghost"
                      aria-pressed={day.wfhHours === hours}
                      disabled={date > dateKey()}
                      onClick={() => patch({ wfhHours: hours })}>
                      {hours} giờ
                    </Button>
                  ))}
                </div>
                <p className="help">
                  {date > dateKey()
                    ? "Ngày tương lai chỉ lưu kế hoạch và request. Chọn giờ WFH khi đến ngày làm việc."
                    : "Giờ làm ròng, không trừ thêm nghỉ trưa và không cần giờ vào/về."}
                </p>
                {!!existing?.sessions.length && (
                  <p className="notice">
                    {day.wfhHours === undefined
                      ? "Các ca đã lưu được giữ nguyên. Chọn 8 hoặc 10 giờ để thay bằng giờ WFH cố định; app sẽ xác nhận khi lưu."
                      : `Khi lưu, ${existing.sessions.length} ca đã ghi sẽ được thay bằng ${day.wfhHours} giờ WFH.`}
                  </p>
                )}
              </fieldset>
            )}
            {day.mode === "wfh" && (
              <fieldset>
                <legend>Request WFH</legend>
                <div className="request-options">
                  {(
                    [
                      ["none", "Chưa gửi"],
                      ["sent", "Đã gửi"],
                      ["approved", "Đã duyệt"],
                    ] as const
                  ).map(([value, text]) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      aria-pressed={day.request === value}
                      onClick={() => patch({ request: value })}
                    >
                      {text}
                    </Button>
                  ))}
                </div>
              </fieldset>
            )}
            {day.mode === "office" && <fieldset className="session-fields">
              <legend>Các ca làm việc</legend>
              <p className="help">
                Đã tự trừ {state.settings.lunchMinutes} phút nghỉ/ngày. Tạm dừng
                là thời gian nghỉ thêm. Để trống giờ về nếu ca còn chạy.
              </p>
              {sessions.map((session, i) => (
                <div className="session-field" key={i}>
                  <div className="section-heading">
                    <strong>Ca {i + 1}</strong>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Bỏ ca ${i + 1}`}
                      onClick={() => {
                        setSessions(sessions.filter((_, j) => i !== j));
                        setDirty(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <Label htmlFor={`start-${i}`}>Giờ vào</Label>
                  <Input
                    id={`start-${i}`}
                    type="datetime-local"
                    step="1"
                    required
                    value={session.start}
                    onChange={(e) => {
                      setSessions(
                        sessions.map((s, j) =>
                          i === j ? { ...s, start: e.target.value } : s,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                  <Label htmlFor={`end-${i}`}>Giờ về</Label>
                  <Input
                    id={`end-${i}`}
                    type="datetime-local"
                    step="1"
                    value={session.end}
                    onChange={(e) => {
                      setSessions(
                        sessions.map((s, j) =>
                          i === j ? { ...s, end: e.target.value } : s,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={sessions.length >= 24}
                onClick={() => {
                  const start = Math.min(
                    dayStart(date) + 9 * 3600000,
                    Date.now() - 3600000,
                  );
                  setSessions([
                    ...sessions,
                    {
                      start: localValue(Math.max(start, dayStart(date))),
                      end: localValue(
                        Math.min(dayStart(date) + 18 * 3600000, Date.now()),
                      ),
                    },
                  ]);
                  setDirty(true);
                }}
              >
                <Plus />
                Thêm ca làm việc
              </Button>
            </fieldset>}
          </>
        ) : (
          <p className="notice">
            Ngày này không yêu cầu giờ làm. Khi lưu, các ca làm trong ngày sẽ
            được bỏ. Ngày lễ và nghỉ phép được đánh dấu thủ công.
          </p>
        )}
        <div>
          <Label htmlFor="day-note">Ghi chú</Label>
          <Textarea
            id="day-note"
            maxLength={1000}
            rows={3}
            value={day.note}
            placeholder="Ví dụ: làm bù giờ thứ Hai…"
            onChange={(e) => patch({ note: e.target.value })}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu ngày làm việc"}
        </Button>
        {existing && (
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => setConfirm("delete")}
          >
            <Trash2 />
            Xóa ngày này
          </Button>
        )}
      </form>
      <AlertDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete"
                ? "Xóa ngày làm việc?"
                : confirm === "replace" ? "Thay cách ghi giờ của ngày này?"
                : "Bỏ thay đổi chưa lưu?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete"
                ? `Toàn bộ ca làm và trạng thái WFH ngày ${date} sẽ bị xóa. Chỉ tiêu giờ của ngày thường sẽ trở lại bình thường.`
                : confirm === "replace"
                  ? day.mode === "wfh" && day.kind === "work"
                    ? `Các ca vào/về đã lưu sẽ được bỏ và thay bằng ${day.wfhHours} giờ WFH làm ròng. Bạn có thể chọn Giữ lại để quay về bản nháp.`
                    : day.kind !== "work"
                      ? "Giờ làm đã lưu của ngày này sẽ bị bỏ khi chuyển sang ngày nghỉ. Chỉ tiêu tuần và tháng sẽ được tính lại."
                      : "Giờ WFH cố định đã lưu sẽ được bỏ. Tổng giờ sẽ được tính lại theo nội dung hiện tại."
                  : "Những thay đổi trên màn hình này chưa được lưu."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async () => {
                if (confirm === "leave") close();
                else if (confirm === "replace") await saveDay();
                else {
                  try {
                    await save((current) => {
                      if (current.version !== baseVersion)
                        throw new Error(
                          "Sổ đã đổi ở tab khác. Hãy quay lại và mở lại ngày này trước khi xóa.",
                        );
                      delete current.days[date];
                      return current;
                    });
                    close();
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Chưa xóa được. Hãy thử lại.",
                    );
                  }
                }
              }}
            >
              {confirm === "delete" ? "Xóa ngày" : confirm === "replace" ? "Thay và lưu" : "Bỏ thay đổi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
