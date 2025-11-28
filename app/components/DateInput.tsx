"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  label?: string;
  value?: string; // expects 'dd' or empty
  onChange?: (value: string) => void; // returns 'dd' when valid, else ''
  required?: boolean;
  className?: string;
  // changing this value will cause the input to re-parse `value` and reset internal fields
  resetKey?: number;
  disabledFields?: { day?: boolean; month?: boolean; year?: boolean };
};

function isValidDateParts(d: number, m: number, y: number) {
  if (!y || !m || !d) return false;
  if (y < 1) return false;
  if (m < 1 || m > 12) return false;
  const maxDays = new Date(y, m, 0).getDate();
  if (d < 1 || d > maxDays) return false;
  return true;
}

export default function DateInput({
  label,
  value,
  onChange,
  required,
  className,
  resetKey,
  disabledFields,
}: Props) {
  const {
    day: disableDay = false,
    month: disableMonth = false,
    year: disableYear = false,
  } = disabledFields || {};

  const parseDateValue = (val?: string) => {
    if (val && val.length === 10) {
      const [year, month, day] = val.split("-");
      return { day, month, year };
    }
    return { day: "", month: "", year: "" };
  };

  const parsed = parseDateValue(value);
  const [day, setDay] = useState(disableDay ? "DD" : parsed.day);
  const [month, setMonth] = useState(disableMonth ? "XX" : parsed.month);
  const [year, setYear] = useState(disableYear ? "XXXX" : parsed.year);

  const dayRef = useRef<HTMLInputElement | null>(null);
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);
  const lastValueRef = useRef<string | undefined>(undefined);
  const isFirstRenderRef = useRef(true);

  // Reset/parse state when `value` or `resetKey` changes
  useEffect(() => {
    // Skip the check on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      lastValueRef.current = value;
      return;
    }

    // Only reset if value changes meaningfully (e.g., full date provided)
    if (value && value.length === 10 && value !== lastValueRef.current) {
      lastValueRef.current = value;
      const newParsed = parseDateValue(value);
      // Schedule update async to avoid sync setState-in-effect lint
      const t = setTimeout(() => {
        setDay(disableDay ? "DD" : newParsed.day);
        setMonth(disableMonth ? "XX" : newParsed.month);
        setYear(disableYear ? "XXXX" : newParsed.year);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [value, resetKey, disableDay, disableMonth, disableYear]);

  useEffect(() => {
    const d = disableDay ? "" : day;
    const m = disableMonth ? "" : month;
    const y = disableYear ? "" : year;

    if (d && m && y && isValidDateParts(Number(d), Number(m), Number(y))) {
      const timeout = setTimeout(() => {
        onChange?.(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
      }, 300); // Debounce by 300ms

      return () => clearTimeout(timeout);
    }
    // Don't call onChange("") for incomplete dates - let the user continue typing
  }, [day, month, year, disableDay, disableMonth, disableYear, onChange]);

  // Derived validation states for live feedback
  const monthNum = Number(month);
  const dayNum = Number(day);

  const monthInvalid =
    month !== "" && (isNaN(monthNum) || monthNum < 1 || monthNum > 12);

  const dayInvalid = day !== "" && (isNaN(dayNum) || dayNum < 1 || dayNum > 31);

  const handleDayChange = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, "").slice(0, 2);
    setDay(cleaned);
  };

  const handleMonthChange = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, "").slice(0, 2);
    setMonth(cleaned);
  };

  const handleYearChange = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, "").slice(0, 4);
    setYear(cleaned);
  };

  const handleKeyDownDay = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && day.length === 0) {
      // nothing to go back to
    }
  };

  const handleKeyDownMonth = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && month.length === 0) {
      dayRef.current?.focus();
    }
  };

  const handleKeyDownYear = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && year.length === 0) {
      monthRef.current?.focus();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {disableDay ? (
          <input
            ref={dayRef}
            placeholder="DD"
            aria-label="Day"
            value="DD"
            disabled
            className="w-12 sm:w-16 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
          />
        ) : (
          <input
            ref={dayRef}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="DD"
            aria-label="Day"
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            onKeyDown={handleKeyDownDay}
            required={required}
            aria-invalid={dayInvalid}
            className={`w-12 sm:w-16 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-600 ${
              dayInvalid
                ? "border-red-400 dark:border-red-600 ring-2 ring-red-300 dark:ring-red-700"
                : "border border-zinc-200 dark:border-zinc-800"
            }`}
          />
        )}

        <span className="text-zinc-400">/</span>

        {disableMonth ? (
          <input
            ref={monthRef}
            placeholder="XX"
            aria-label="Month"
            value="XX"
            disabled
            className="w-12 sm:w-16 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
          />
        ) : (
          <input
            ref={monthRef}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="MM"
            aria-label="Month"
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            onKeyDown={handleKeyDownMonth}
            required={required}
            aria-invalid={monthInvalid}
            className={`w-12 sm:w-16 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-600 ${
              monthInvalid
                ? "border-red-400 dark:border-red-600 ring-2 ring-red-300 dark:ring-red-700"
                : "border border-zinc-200 dark:border-zinc-800"
            }`}
          />
        )}

        <span className="text-zinc-400">/</span>

        {disableYear ? (
          <input
            ref={yearRef}
            placeholder="XXXX"
            aria-label="Year"
            value="XXXX"
            disabled
            className="w-20 sm:w-28 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
          />
        ) : (
          <input
            ref={yearRef}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="YYYY"
            aria-label="Year"
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            onKeyDown={handleKeyDownYear}
            required={required}
            aria-invalid={false}
            className={`w-20 sm:w-28 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-600 border border-zinc-200 dark:border-zinc-800`}
          />
        )}
      </div>
    </div>
  );
}
