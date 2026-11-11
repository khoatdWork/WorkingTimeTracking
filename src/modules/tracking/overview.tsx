"use client";

import { useId, type ReactNode } from "react";
import {
  Building2,
  House,
  ArrowUpRight,
  Pause,
  Play,
  LogOut,
  Check,
  CircleCheck,
  Pencil,
  Coffee,
  AlertCircle,
  ChevronDown,
  CalendarCheck2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  activeSession,
  addDays,
  dateKey,
  dateLabel,
  duration,
  grossSeconds,
  monthDates,
  newDay,
  readableDuration,
  startWork,
  setWfhHours,
  stopWork,
  summarize,
  targetSeconds,
  timeLabel,
  weekStart,
  wfhDays,
  workedSeconds,
  type TrackerState,
  type WorkMode,
} from "@/modules/tracking/core/domain";

type Run = (
  change: (state: TrackerState) => TrackerState,
  message: string,
) => Promise<boolean>;
const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export type TodaySection = "week" | "month" | "sessions" | "request";
export function Today({
  state,
  now,
  busy,
  run,
  edit,
  expanded,
  setExpanded,
}: {
  state: TrackerState;
  now: number;
  busy: boolean;
  run: Run;
  edit: (d: string) => void;
  expanded: TodaySection[];
  setExpanded: (sections: TodaySection[]) => void;
}) {
  const today = dateKey(now),
    day = state.days[today] ?? newDay(today),
    active = activeSession(state);
  const worked = workedSeconds(state, today, now),
    target = targetSeconds(state, today),
    gross = grossSeconds(state, today, now);
  const remaining = Math.max(0, target - worked),
    ratio = target ? Math.min(1, worked / target) : 0;
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart(today), i),
  );
  const week = summarize(state, weekDates, now),
    month = summarize(state, monthDates(today.slice(0, 7)), now);
  const homes = wfhDays(state, weekDates),
    pending = homes.filter((d) => d.request === "none");
  function detail(section: TodaySection) {
    return {
      open: expanded.includes(section),
      onOpenChange: (open: boolean) => setExpanded(open ? [...expanded, section] : expanded.filter((value) => value !== section)),
      busy,
    };
  }
  async function mode(next: WorkMode) {
    await run(
      (s) => {
        const d = s.days[today] ?? newDay(today);
        if ((d.sessions.length || d.wfhHours !== undefined) && d.mode !== next)
          throw new Error(
            "Ngày đã ghi giờ làm. Hãy đổi nơi làm việc trong Chỉnh sửa ngày để tránh mất giờ đã lưu.",
          );
        s.days[today] = { ...d, mode: next };
        return s;
      },
      next === "wfh" ? "Đã chọn WFH hôm nay" : "Đã chọn làm tại văn phòng",
    );
  }
  const finishAt = active
    ? now +
      Math.max(0, target + state.settings.lunchMinutes * 60 - gross) * 1000
    : null;
  return (
    <>
      <div className="page-heading today-heading">
        <div className="section-heading">
          <h1>Hôm nay</h1>
          <span className={`status-pill ${day.kind !== "work" ? "is-time-off" : active ? "is-working" : ""}`}>
            <span />
            {day.kind !== "work" ? day.kind === "leave" ? "Nghỉ phép" : "Ngày nghỉ lễ" : active
              ? "Đang làm việc"
              : day.sessions.length || day.wfhHours !== undefined
                ? "Đã ghi nhận"
                : day.mode === "wfh" ? "Chưa chọn giờ"
                : "Chưa bắt đầu"}
          </span>
        </div>
        <p className="subtitle capitalize">{dateLabel(today)}</p>
      </div>
      {day.kind !== "work" ? (
        <section className="panel form-stack today-time-off" aria-label="Ngày nghỉ hôm nay">
          <CalendarCheck2 className="time-off-icon" size={32} aria-hidden="true" />
          <h2>{day.kind === "leave" ? "Hôm nay bạn nghỉ phép" : "Hôm nay là ngày nghỉ lễ"}</h2>
          <p className="time-off-description">Không yêu cầu giờ làm hôm nay. Chỉ tiêu tuần và tháng đã cập nhật.</p>
          {day.note && <div className="time-off-note"><span>Ghi chú</span><p>{day.note}</p></div>}
          {active && <div className="notice">
            Ca từ {active.day.date.split("-").reverse().join("/")} vẫn đang chạy.
            <Button variant="outline" disabled={busy} onClick={() => run(
              (s) => stopWork(s, Date.now()), "Đã ghi nhận giờ kết thúc ca",
            )}>Kết thúc ca đang chạy</Button>
          </div>}
          <Button variant="outline" disabled={busy} onClick={() => edit(today)}>
            <Pencil size={17} aria-hidden="true" />Chỉnh sửa ngày / bổ sung giờ
          </Button>
        </section>
      ) : <section className="clock-panel" aria-label="Chấm công hôm nay">
        <div className="segmented mode-select">
          <Button
            variant="ghost"
            aria-pressed={day.mode === "office"}
            disabled={busy || !!active}
            onClick={() => mode("office")}
          >
            <Building2 size={17} />
            Văn phòng
          </Button>
          <Button
            variant="ghost"
            aria-pressed={day.mode === "wfh"}
            disabled={busy || !!active}
            onClick={() => mode("wfh")}
          >
            <House size={17} />
            Work from home
          </Button>
        </div>
        <div className={`clock-face${day.mode === "wfh" && !day.sessions.length ? " fixed-hours" : ""}`}>
          {!(day.mode === "wfh" && !day.sessions.length) && <svg viewBox="0 0 240 240" aria-hidden="true">
            <circle className="clock-track" cx="120" cy="120" r="106" />
            <circle
              className="clock-progress"
              cx="120"
              cy="120"
              r="106"
              pathLength="100"
              strokeDasharray={`${ratio * 100} 100`}
            />
          </svg>}
          <div className="clock-value">
            <span className="clock-caption">{day.mode === "wfh" ? "Giờ WFH đã ghi nhận" : "Thời gian làm việc"}</span>
            <strong
              className="timer-digits"
              aria-label={`Đã làm ${readableDuration(worked)}`}
            >
              {duration(worked, true)}
            </strong>
            <span className="clock-target">
              {target
                ? `mục tiêu ${duration(target)} giờ`
                : "Ngày không có chỉ tiêu"}
            </span>
          </div>
        </div>
        <div className={`daily-balance ${remaining ? "" : "positive"}`}>
          {remaining ? (
            <>
              <span className="balance-dot" />
              Còn {readableDuration(remaining)} để đủ giờ
            </>
          ) : (
            <>
              <CircleCheck size={16} />
              {target
                ? `Đã đủ giờ${worked > target ? ` · Dư ${readableDuration(worked - target)}` : ""}`
                : "Không yêu cầu giờ làm hôm nay"}
            </>
          )}
        </div>
        {active && active.day.date !== today && (
          <div className="notice">
            Ca từ {active.day.date} vẫn đang chạy. Kết thúc ca hoặc chỉnh lại
            giờ để tránh tính nhầm.
          </div>
        )}
        <div className="clock-actions">
          {active ? (
            <div className="active-actions">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    (s) => stopWork(s, Date.now()),
                    "Đã tạm dừng. Bấm tiếp tục khi quay lại.",
                  )
                }
              >
                <Pause size={17} />
                Tạm dừng
              </Button>
              <Button
                disabled={busy}
                onClick={() =>
                  run(
                    (s) => stopWork(s, Date.now()),
                    "Đã ghi nhận giờ kết thúc ca",
                  )
                }
              >
                <LogOut size={17} />
                {busy
                  ? "Đang lưu…"
                  : day.mode === "office"
                    ? "Đã rời công ty"
                    : "Kết thúc WFH"}
              </Button>
            </div>
          ) : day.mode === "wfh" ? (
            day.sessions.length ? (
              <p className="notice">
                Các ca WFH cũ được giữ nguyên. Mở Chỉnh sửa ngày để thay bằng 8 hoặc 10 giờ.
              </p>
            ) : (
              <fieldset>
                <legend>Giờ làm WFH</legend>
                <div className="segmented">
                  {([8, 10] as const).map((hours) => (
                    <Button key={hours} variant="ghost" disabled={busy}
                      aria-pressed={day.wfhHours === hours}
                      onClick={() => run(
                        (s) => setWfhHours(s, today, hours, Date.now()),
                        `Đã ghi nhận ${hours} giờ WFH`,
                      )}>
                      {hours} giờ
                    </Button>
                  ))}
                </div>
              </fieldset>
            )
          ) : (
            <Button
              className="check-in-button"
              disabled={busy}
              onClick={() =>
                run(
                  (s) => startWork(s, day.mode, Date.now()),
                  "Đã bắt đầu tính giờ làm việc",
                )
              }
            >
              <Play size={18} fill="currentColor" />
              {busy
                ? "Đang lưu…"
                : day.sessions.length
                  ? "Tiếp tục làm việc"
                  : "Đã lên công ty"}
            </Button>
          )}
        </div>
        {day.mode === "wfh" && !day.sessions.length ? (
          <p className="clock-note">Giờ làm ròng, không trừ thêm nghỉ trưa.</p>
        ) : <div className="clock-note">
          <Coffee size={15} />
          <span>
            Nghỉ trưa tự động: {state.settings.lunchMinutes} phút
          </span>
        </div>}
        {finishAt !== null && remaining > 0 && (
          <p className="finish-time">
            Nếu làm liên tục, đủ giờ lúc{" "}
            <strong>
              {timeLabel(finishAt)}
              {dateKey(finishAt) !== today ? " ngày mai" : ""}
            </strong>
          </p>
        )}
        <Button
          variant="link"
          className="edit-today"
          aria-label="Chỉnh sửa ngày / bổ sung giờ"
          onClick={() => edit(today)}
        >
          <Pencil size={13} />
          Chỉnh sửa ngày
        </Button>
      {day.kind === "work" && day.mode === "wfh" && (
        <TodayDetail title="Request WFH hôm nay" {...detail("request")} className="wfh-request"
          summary={
            <Badge
              variant="outline"
              className={
                day.request === "none" ? "warning-badge" : "success-badge"
              }
            >
              {day.request === "none"
                ? "Chưa gửi"
                : day.request === "sent"
                  ? "Đã gửi"
                  : "Đã duyệt"}
            </Badge>
          }>
          <p>Gửi request qua kênh công ty, rồi cập nhật tại đây.</p>
          <div className="request-options">
            {(
              [
                ["none", "Chưa gửi"],
                ["sent", "Đã gửi request"],
                ["approved", "Đã được duyệt"],
              ] as const
            ).map(([value, text]) => (
              <Button
                key={value}
                variant="outline"
                disabled={busy}
                aria-pressed={day.request === value}
                onClick={() =>
                  run((s) => {
                    s.days[today] = {
                      ...(s.days[today] ?? day),
                      request: value,
                    };
                    return s;
                  }, "Đã cập nhật trạng thái request")
                }
              >
                {day.request === value && <Check size={14} />}
                {text}
              </Button>
            ))}
          </div>
        </TodayDetail>
      )}
      </section>}
      <div className="today-details">
      <TodayDetail title="Tuần này" {...detail("week")}
        summary={<>
          <span>{duration(week.worked)} / {duration(week.target)} giờ · WFH {homes.length}/{state.settings.wfhLimit}</span>
          {pending.length > 0 && <span className="warning-text">{pending.length} ngày WFH chưa gửi request</span>}
          {homes.length > state.settings.wfhLimit && <span className="warning-text">Vượt giới hạn {homes.length - state.settings.wfhLimit} ngày WFH</span>}
        </>}>
      {pending.length > 0 && (
        <div className="inline-notice">
          <AlertCircle size={17} />
          <span>
            {pending.length} ngày WFH trong tuần chưa đánh dấu gửi request:{" "}
            {pending.map((d) => d.date.slice(8)).join(", ")}.
          </span>
        </div>
      )}
      <section className="panel week-panel">
        <div className="section-heading">
          <span className="date-range">
            {weekDates[0].slice(8)}/{weekDates[0].slice(5, 7)} –{" "}
            {weekDates[6].slice(8)}/{weekDates[6].slice(5, 7)}
          </span>
        </div>
        <div className="week-ledger">
          <strong>
            {duration(week.worked, true)}
            <span> / {duration(week.target)}</span>
          </strong>
          <span>giờ làm việc</span>
        </div>
        <div className="week-strip">
          {weekDates.map((date, i) => {
            const seconds = workedSeconds(state, date, now),
              required = targetSeconds(state, date),
              record = state.days[date];
            return (
              <Button
                variant="ghost"
                key={date}
                className={`week-day ${date === today ? "is-today" : ""} ${seconds >= required && seconds > 0 ? "is-complete" : ""}`}
                aria-label={`${dateLabel(date)}: ${record?.kind === "leave" ? "Nghỉ phép. " : record?.kind === "holiday" ? "Ngày nghỉ lễ. " : ""}${readableDuration(seconds)}. Chỉnh sửa`}
                onClick={() => edit(date)}
              >
                <span>{WEEK_LABELS[i]}</span>
                <span className="day-number">{date.slice(8)}</span>
                <span
                  className={`day-marker ${record?.mode === "wfh" ? "wfh" : ""}`}
                >
                  {record?.kind === "leave" ? "P" : seconds > 0 ? (
                    <Check size={11} />
                  ) : required === 0 ? (
                    "–"
                  ) : (
                    ""
                  )}
                </span>
              </Button>
            );
          })}
        </div>
        {weekDates.some((date) => state.days[date]?.kind === "leave") && <p className="help">P: Nghỉ phép</p>}
        <div className="week-footer">
          <span>
            <House size={15} />
            WFH{" "}
            <strong>
              {homes.length}/{state.settings.wfhLimit} ngày
            </strong>
          </span>
          <span className={week.balance >= 0 ? "positive" : "warning-text"}>
            {week.balance >= 0 ? "Dư" : "Thiếu"}{" "}
            {readableDuration(week.balance)}
            <small>đến hôm nay</small>
          </span>
        </div>
        {homes.length > state.settings.wfhLimit && (
          <p className="form-error" role="status">
            Đã vượt giới hạn WFH {homes.length - state.settings.wfhLimit} ngày
            trong tuần.
          </p>
        )}
      </section>
      </TodayDetail>
      <TodayDetail title={`Tháng ${Number(today.slice(5, 7))}`} {...detail("month")}
        summary={<>
          <span>Còn {duration(month.remaining, true)} giờ cả tháng</span>
          <span className={month.balance < 0 ? "warning-text" : "positive"}>
            {month.balance < 0 ? "Thiếu" : "Dư"} {duration(Math.abs(month.balance), true)} giờ đến hôm nay
          </span>
        </>}>
      <section className="month-overview">
        <div className="section-heading">
          <span>{month.workdays} ngày công</span>
        </div>
        <div
          className="month-progress"
          role="progressbar"
          aria-label="Tiến độ giờ tháng"
          aria-valuemin={0}
          aria-valuemax={month.target || 1}
          aria-valuenow={Math.min(month.worked, month.target)}
        >
          <span
            style={{
              width: `${month.target ? Math.min(100, (month.worked / month.target) * 100) : 0}%`,
            }}
          />
        </div>
        <dl className="summary-rows">
          <div>
            <dt>Đã làm / Cần làm</dt>
            <dd>
              {duration(month.worked, true)}{" "}
              <span>/ {duration(month.target)}</span>
            </dd>
          </div>
          <div>
            <dt>Còn lại cả tháng</dt>
            <dd>{readableDuration(month.remaining)}</dd>
          </div>
          <div>
            <dt>
              {month.balance < 0 ? "Thiếu đến hôm nay" : "Dư đến hôm nay"}
            </dt>
            <dd className={month.balance < 0 ? "warning-text" : "positive"}>
              {readableDuration(month.balance)}
            </dd>
          </div>
        </dl>
        <p className="help">
          Giờ dư hôm nay bù giờ thiếu trong tháng. Cuối tuần có thể làm bù;
          không tự cộng chỉ tiêu.
        </p>
      </section>
      </TodayDetail>
      {!!day.sessions.length && <TodayDetail title="Các ca hôm nay" {...detail("sessions")}
        summary={`${day.sessions.length} ca đã ghi${active?.day.date === today ? ", đang làm việc" : ""}`}>
        <SessionList day={day} now={now} />
      </TodayDetail>}
      </div>
    </>
  );
}
function TodayDetail({ title, summary, open, onOpenChange, busy, className = "", children }: {
  title: string;
  summary: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  className?: string;
  children: ReactNode;
}) {
  const summaryId = useId();
  return <Collapsible className={`today-detail ${className}`} open={open} onOpenChange={onOpenChange}>
    <h2><CollapsibleTrigger asChild>
      <Button variant="ghost" className="today-detail-trigger" aria-label={title} aria-describedby={summaryId} disabled={busy}>
        <span className="today-detail-copy"><span>{title}</span><small id={summaryId}>{summary}</small></span>
        <ChevronDown size={18} aria-hidden="true" />
      </Button>
    </CollapsibleTrigger></h2>
    <CollapsibleContent forceMount className="today-detail-content">{children}</CollapsibleContent>
  </Collapsible>;
}
function SessionList({
  day,
  now,
}: {
  day: ReturnType<typeof newDay>;
  now: number;
}) {
  if (!day.sessions.length) return null;
  return (
    <section className="sessions-section">
      {day.sessions.map((s, i) => (
        <div className="session-row" key={s.start}>
          <span className="session-icon">
            <ArrowUpRight size={17} />
          </span>
          <div>
            <strong>
              {timeLabel(s.start)} <span>—</span>{" "}
              {s.end ? timeLabel(s.end) : "đang làm"}
            </strong>
            <small>
              Ca {i + 1} · {day.mode === "office" ? "Văn phòng" : "WFH"}
            </small>
          </div>
          <span>
            {duration(Math.floor(((s.end ?? now) - s.start) / 1000), true)}
          </span>
        </div>
      ))}
      <p className="help">
        Thời lượng ca chưa trừ nghỉ trưa. Tổng hôm nay đã trừ một lần.
      </p>
    </section>
  );
}
