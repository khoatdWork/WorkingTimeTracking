"use client";

import { Building2, House } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  dateKey,
  dateLabel,
  duration,
  monthDates,
  readableDuration,
  summarize,
  targetSeconds,
  weekStart,
  wfhDays,
  workedSeconds,
  type TrackerState,
} from "@/modules/tracking/core/domain";

import { MonthPicker } from "./month-picker";
export function Reports({
  state,
  now,
  month,
  setMonth,
  edit,
}: {
  state: TrackerState;
  now: number;
  month: string;
  setMonth: (m: string) => void;
  edit: (d: string) => void;
}) {
  const dates = monthDates(month),
    total = summarize(state, dates, now),
    today = dateKey(now);
  const weeks = Array.from(new Set(dates.map(weekStart)));
  const office = dates.filter(
    (d) => state.days[d]?.mode === "office" && state.days[d]?.sessions.length,
  ).length;
  const homes = wfhDays(state, dates),
    pending = homes.filter((d) => d.request === "none");
  return (
    <>
      <div className="page-heading">
        <h1>Báo cáo thời gian</h1>
        <p className="subtitle">
          Biết mình đang ở đâu, cần làm thêm bao nhiêu.
        </p>
      </div>
      <MonthPicker month={month} setMonth={setMonth} />
      <section className="report-total panel">
        <span className="report-caption">Đã làm trong tháng</span>
        <strong className="report-number">
          {duration(total.worked, true)}
        </strong>
        <p>trên {readableDuration(total.target)} cần hoàn thành</p>
        <div className="month-progress">
          <span
            style={{
              width: `${total.target ? Math.min(100, (total.worked / total.target) * 100) : 0}%`,
            }}
          />
        </div>
        <dl className="summary-rows">
          <div>
            <dt>Còn lại cả tháng</dt>
            <dd>{readableDuration(total.remaining)}</dd>
          </div>
          <div>
            <dt>
              {total.balance < 0 ? "Thiếu đến hôm nay" : "Dư đến hôm nay"}
            </dt>
            <dd className={total.balance < 0 ? "warning-text" : "positive"}>
              {readableDuration(total.balance)}
            </dd>
          </div>
          <div>
            <dt>Chỉ tiêu đến hôm nay</dt>
            <dd>{readableDuration(total.due)}</dd>
          </div>
          <div>
            <dt>Ngày công / ngày còn lại</dt>
            <dd>
              {total.workdays} / {total.futureDays}
            </dd>
          </div>
        </dl>
        {total.futureDays > 0 && month <= today.slice(0, 7) && (
          <div className="notice">
            Nếu dừng làm hôm nay, cần trung bình{" "}
            <strong>{readableDuration(total.dailyNeeded)}/ngày</strong> trong{" "}
            {total.futureDays} ngày công tiếp theo.
          </div>
        )}
        {total.futureDays === 0 && total.remaining > 0 && (
          <div className="notice">
            Tháng này còn thiếu {readableDuration(total.remaining)}. Kiểm tra
            các ca quên ghi trước khi chốt công.
          </div>
        )}
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>Nơi làm việc</h2>
          <Building2 size={18} />
        </div>
        <div className="location-stats">
          <div>
            <Building2 size={18} />
            <strong>
              {office}
              <small>ngày văn phòng</small>
            </strong>
          </div>
          <div>
            <House size={18} />
            <strong>
              {homes.length}
              <small>ngày WFH</small>
            </strong>
          </div>
        </div>
        <p className={pending.length ? "warning-text help" : "positive help"}>
          {pending.length
            ? `${pending.length} ngày WFH chưa đánh dấu gửi request.`
            : "Không có request WFH nào đang chờ gửi."}
        </p>
      </section>
      <section className="weekly-report">
        <h2>Đối chiếu từng tuần</h2>
        <p className="help">
          Chỉ cộng các ngày thuộc tháng đang chọn. Tuần giao tháng có thể có ít
          hơn 5 ngày công.
        </p>
        {weeks.map((start, i) => {
          const inMonth = dates.filter((d) => weekStart(d) === start),
            result = summarize(state, inMonth, now);
          return (
            <div className="report-week" key={start}>
              <div className="section-heading">
                <h3>
                  Tuần {i + 1}
                  <span>
                    {inMonth[0].slice(8)}–{inMonth.at(-1)!.slice(8)}/
                    {month.slice(5)}
                  </span>
                </h3>
                <strong>
                  {duration(result.worked, true)}
                  <span> / {duration(result.target)}</span>
                </strong>
              </div>
              <div className="day-bars">
                {inMonth.map((date) => {
                  const seconds = workedSeconds(state, date, now),
                    target = targetSeconds(state, date);
                  return (
                    <Button
                      variant="ghost"
                      key={date}
                      className="day-bar-button"
                      aria-label={`${dateLabel(date)}: ${readableDuration(seconds)}. Chỉnh sửa`}
                      onClick={() => edit(date)}
                    >
                      <span className="bar-track">
                        <span
                          className={
                            seconds >= target && seconds ? "complete-bar" : ""
                          }
                          style={{
                            height: `${Math.min(100, (seconds / Math.max(target, state.settings.dailyMinutes * 60)) * 100)}%`,
                          }}
                        />
                      </span>
                      <span>{date.slice(8)}</span>
                    </Button>
                  );
                })}
              </div>
              <p className={result.balance < 0 ? "warning-text" : "positive"}>
                {result.balance < 0 ? "Thiếu" : "Dư"}{" "}
                {readableDuration(result.balance)}{" "}
                <span className="muted">so với chỉ tiêu đến hôm nay</span>
              </p>
            </div>
          );
        })}
      </section>
    </>
  );
}
