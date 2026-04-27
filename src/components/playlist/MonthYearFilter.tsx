"use client";

import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthName } from "@/lib/constants";

interface MonthYearFilterProps {
  availableYears: number[];
  availableMonths: number[];
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export function MonthYearFilter({
  availableYears,
  availableMonths,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: MonthYearFilterProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-md border border-border w-full sm:w-auto">
      <Calendar className="w-5 h-5 text-secondary shrink-0" strokeWidth={2.5} />
      <Select
        value={selectedYear.toString()}
        onValueChange={(v) => onYearChange(parseInt(v, 10))}
      >
        <SelectTrigger className="flex-1 sm:w-28 sm:flex-none bg-transparent border-0 shadow-none font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedMonth.toString()}
        onValueChange={(v) => onMonthChange(parseInt(v, 10))}
      >
        <SelectTrigger className="flex-1 sm:w-36 sm:flex-none bg-transparent border-0 shadow-none font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {getMonthName(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
