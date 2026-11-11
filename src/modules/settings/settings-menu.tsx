"use client";

import { CalendarCheck2, CalendarDays, ChevronRight, Clock3, Cloud, DatabaseBackup, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/modules/tracking/core/domain";

export const SETTINGS_TITLES = {
  hours: "Quy tắc giờ làm",
  leave: "Nghỉ phép",
  holidays: "Ngày nghỉ lễ",
  account: "Tài khoản & đồng bộ",
  app: "Cài ứng dụng",
  backup: "Bản sao lưu",
};
export type SettingsSection = keyof typeof SETTINGS_TITLES;

export function SettingsMenu({ settings, account, updateAvailable, offlineReady, busy, open }: {
  settings: Settings;
  account: string | null;
  updateAvailable: boolean;
  offlineReady: boolean;
  busy: boolean;
  open: (section: SettingsSection) => void;
}) {
  const rows = {
    account: { icon: Cloud, summary: account || "Đăng nhập Google để đồng bộ", color: "blue" },
    hours: { icon: Clock3, summary: `${new Intl.NumberFormat("vi-VN").format(settings.dailyMinutes / 60)} giờ/ngày · Nghỉ trưa ${settings.lunchMinutes} phút`, color: "blue" },
    leave: { icon: CalendarCheck2, summary: "Thêm và quản lý ngày nghỉ phép", color: "green" },
    holidays: { icon: CalendarDays, summary: "Thêm và quản lý lịch nghỉ lễ", color: "green" },
    app: { icon: Smartphone, summary: updateAvailable ? "Có bản cập nhật mới" : offlineReady ? "Sẵn sàng dùng khi mất mạng" : "Cài đặt và sử dụng offline", color: "green" },
    backup: { icon: DatabaseBackup, summary: "Xuất, nhập và quản lý dữ liệu", color: "slate" },
  };
  return (
    <div className="settings-menu">
      {([
        { label: "Tài khoản", sections: ["account"] },
        { label: "Chấm công", sections: ["hours", "leave", "holidays"] },
        { label: "Ứng dụng và dữ liệu", sections: ["app", "backup"] },
      ] as const).map((group) => (
        <ul className="settings-group" aria-label={group.label} key={group.label}>
          {group.sections.map((section) => {
            const row = rows[section];
            return <li key={section}>
              <Button variant="ghost" className="settings-row" disabled={busy}
                aria-label={SETTINGS_TITLES[section]} aria-describedby={`settings-${section}-summary`}
                onClick={() => open(section)}>
                <span className={`settings-icon ${row.color}`}><row.icon size={19} aria-hidden="true" /></span>
                <span className="settings-row-copy">
                  <strong>{SETTINGS_TITLES[section]}</strong>
                  <small id={`settings-${section}-summary`}>{row.summary}</small>
                </span>
                <ChevronRight size={18} className="settings-chevron" aria-hidden="true" />
              </Button>
            </li>;
          })}
        </ul>
      ))}
    </div>
  );
}
