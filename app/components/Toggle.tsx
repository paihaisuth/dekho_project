"use client";

import React, { useRef } from "react";
import { t } from "../i18n";

type Option = { value: string; label: React.ReactNode };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options?: Option[];
  className?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  ariaLabel?: string;
  locale?: string;
};

export default function Toggle({
  value,
  onChange,
  locale = "en",
  options,
  className,
  orientation = "horizontal",
  size = "md",
  ariaLabel,
}: Props) {
  const opts: Option[] = options ?? [
    { value: "single", label: t(locale, "single") },
    { value: "multiple", label: t(locale, "multiple") },
  ];

  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const gap = orientation === "horizontal" ? "gap-1" : "flex-col gap-2";
  const padding = size === "sm" ? "px-2 py-0.5 text-sm" : "px-3 py-1 text-sm";

  const focusAt = (idx: number) => {
    const el = refs.current[idx];
    if (el) el.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const last = opts.length - 1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx === last ? 0 : idx + 1;
      focusAt(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = idx === 0 ? last : idx - 1;
      focusAt(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(last);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(opts[idx].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`${
        orientation === "horizontal"
          ? "inline-flex items-center"
          : "flex flex-col"
      } ${className ?? ""} ${gap} bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl`}
    >
      {opts.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onClick={() => onChange(o.value)}
            className={`rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${padding} ${
              selected
                ? "bg-cyan-600 text-white shadow"
                : "bg-transparent text-zinc-700 hover:bg-zinc-100"
            } cursor-pointer`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
