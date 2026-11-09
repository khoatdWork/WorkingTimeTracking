"use client";
import { useState } from "react";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type Settings } from "@/modules/tracking/core/domain";

export function SettingsForm({
  settings,
  busy,
  onSave,
}: {
  settings: Settings;
  busy: boolean;
  onSave: (s: Settings) => Promise<boolean>;
}) {
  const [daily, setDaily] = useState(String(settings.dailyMinutes / 60)),
    [lunch, setLunch] = useState(String(settings.lunchMinutes)),
    [limit, setLimit] = useState(settings.wfhLimit);
  const [error, setError] = useState("");
  return (
    <form
      className="panel form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const dailyMinutes = Number(daily) * 60;
        if (
          !Number.isInteger(dailyMinutes) ||
          dailyMinutes < 1 ||
          dailyMinutes > 1440 ||
          !Number.isInteger(Number(lunch)) ||
          Number(lunch) < 0 ||
          Number(lunch) > 180
        ) {
          setError(
            "Nhập giờ làm từ 1 phút đến 24 giờ và thời gian nghỉ từ 0 đến 180 phút.",
          );
          return;
        }
        await onSave({
          dailyMinutes,
          lunchMinutes: Number(lunch),
          wfhLimit: limit,
        });
      }}
    >
      <div className="section-heading">
        <h2>Quy tắc giờ làm</h2>
        <Clock3 size={18} />
      </div>
      <div>
        <Label htmlFor="daily-hours">Giờ làm mỗi ngày</Label>
        <Input
          id="daily-hours"
          name="daily-hours"
          type="number"
          min="0.1"
          max="24"
          step="0.1"
          required
          value={daily}
          onChange={(e) => setDaily(e.target.value)}
        />
        <p className="help">Áp dụng thứ Hai đến thứ Sáu.</p>
      </div>
      <div>
        <Label htmlFor="lunch-minutes">Tự trừ nghỉ trưa (phút/ngày)</Label>
        <Input
          id="lunch-minutes"
          name="lunch-minutes"
          type="number"
          min="0"
          max="180"
          step="1"
          required
          value={lunch}
          onChange={(e) => setLunch(e.target.value)}
        />
        <p className="help">
          Áp dụng cho ngày ghi theo ca. WFH chọn 8/10 giờ đã là giờ làm ròng, không trừ thêm. Nút tạm dừng dành cho thời gian
          nghỉ thêm ngoài nghỉ trưa.
        </p>
      </div>
      <fieldset>
        <legend>WFH tối đa mỗi tuần</legend>
        <div className="segmented">
          {[2, 3].map((n) => (
            <Button
              key={n}
              type="button"
              variant="ghost"
              aria-pressed={limit === n}
              onClick={() => setLimit(n)}
            >
              {n} ngày
            </Button>
          ))}
        </div>
      </fieldset>
      <p className="notice">
        Thay đổi cài đặt sẽ tính lại toàn bộ lịch sử. Giờ dư chỉ bù trong cùng
        tháng; không chuyển sang tháng sau.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? "Đang lưu…" : "Lưu cài đặt"}
      </Button>
    </form>
  );
}
