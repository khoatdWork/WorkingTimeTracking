"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MonthPicker({
  month,
  setMonth,
}: {
  month: string;
  setMonth: (month: string) => void;
}) {
  function shift(by: number) {
    const d = new Date(`${month}-15T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + by);
    setMonth(d.toISOString().slice(0, 7));
  }
  return (
    <div className="month-picker">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tháng trước"
        disabled={month <= "2000-01"}
        onClick={() => shift(-1)}
      >
        <ChevronLeft />
      </Button>
      <div>
        <Label htmlFor="filter-month" className="sr-only">
          Chọn tháng
        </Label>
        <Input
          id="filter-month"
          type="month"
          min="2000-01"
          max="2100-12"
          value={month}
          onChange={(e) => {
            if (/^\d{4}-\d{2}$/.test(e.target.value)) setMonth(e.target.value);
          }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tháng sau"
        disabled={month >= "2100-12"}
        onClick={() => shift(1)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
