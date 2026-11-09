"use client";
import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  dateKey,
  dateLabel,
  duration,
  monthDates,
  targetSeconds,
  workedSeconds,
  type TrackerState,
} from "@/modules/tracking/core/domain";

import { MonthPicker } from "./month-picker";
export function History({
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
  const [newDate, setNewDate] = useState(dateKey(now)),
    [filter, setFilter] = useState<"all" | "wfh" | "missing">("all");
  const dates = monthDates(month)
    .filter((d) => d <= dateKey(now) || state.days[d])
    .reverse();
  const visible = dates.filter(
    (date) =>
      filter === "all" ||
      (filter === "wfh"
        ? state.days[date]?.mode === "wfh"
        : workedSeconds(state, date, now) < targetSeconds(state, date)),
  );
  return (
    <>
      <div className="page-heading">
        <h1>Lịch sử làm việc</h1>
        <p className="subtitle">Mỗi ca làm, mỗi phút đều có trong sổ.</p>
      </div>
      <MonthPicker month={month} setMonth={setMonth} />
      <div className="history-add">
        <div>
          <Label htmlFor="add-date" className="sr-only">
            Ngày cần bổ sung
          </Label>
          <Input
            id="add-date"
            type="date"
            min="2000-01-01"
            max="2100-12-31"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <Button disabled={!newDate} onClick={() => edit(newDate)}>
          <Plus size={17} />
          Bổ sung
        </Button>
      </div>
      <div className="filter-buttons" aria-label="Lọc lịch sử">
        {(
          [
            ["all", "Tất cả"],
            ["wfh", "WFH"],
            ["missing", "Thiếu giờ"],
          ] as const
        ).map(([id, text]) => (
          <Button
            key={id}
            variant="ghost"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {text}
          </Button>
        ))}
      </div>
      <div className="history-list">
        {!visible.length && (
          <div className="empty-state">
            <CalendarDays />
            <h2>Chưa có ngày phù hợp</h2>
            <p>Chọn tháng khác hoặc bổ sung ngày làm việc.</p>
          </div>
        )}
        {visible.map((date) => {
          const day = state.days[date],
            seconds = workedSeconds(state, date, now),
            target = targetSeconds(state, date);
          return (
            <Button
              key={date}
              variant="ghost"
              className="history-row"
              onClick={() => edit(date)}
            >
              <div
                className={`date-tile ${date === dateKey(now) ? "today-tile" : ""}`}
              >
                <strong>{date.slice(8)}</strong>
                <span>{dateLabel(date, { weekday: "short" })}</span>
              </div>
              <div className="history-description">
                <strong>
                  {day?.kind === "leave"
                    ? "Nghỉ phép"
                    : day?.kind === "holiday"
                      ? "Ngày lễ"
                      : day?.mode === "wfh"
                        ? "Work from home"
                        : day?.sessions.length
                          ? "Văn phòng"
                          : target
                            ? "Chưa chấm công"
                            : "Cuối tuần"}
                </strong>
                <small>
                  {day?.mode === "wfh"
                    ? day.request === "none"
                      ? "Request chưa gửi"
                      : day.request === "sent"
                        ? "Đã gửi request"
                        : "Request đã duyệt"
                    : day?.sessions.length
                      ? `${day.sessions.length} ca làm việc`
                      : "Bấm để bổ sung"}
                </small>
              </div>
              <div className="history-hours">
                <strong>{duration(seconds, true)}</strong>
                <small
                  className={seconds < target ? "warning-text" : "positive"}
                >
                  {seconds < target
                    ? `−${duration(target - seconds, true)}`
                    : target || seconds
                      ? `+${duration(seconds - target, true)}`
                      : "Không chỉ tiêu"}
                </small>
              </div>
            </Button>
          );
        })}
      </div>
      <p className="footnote">
        Giờ nghỉ được trừ một lần/ngày. Chọn một ngày để sửa ca, đánh dấu nghỉ
        phép hoặc ngày lễ.
      </p>
    </>
  );
}
