"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Importing the React icon

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
}

export default function Dropdown({
  label,
  options = [],
  value = "", // Ensure default value is an empty string
  onChange,
  disabled,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hasOptions = options.length > 0;
  const extendedOptions = hasOptions
    ? [{ value: "", label: "Please select" }, ...options]
    : [{ value: "", label: "No options" }];
  const selected =
    (extendedOptions.find((o) => o.value === value) || {}).label || "";

  const handleSelect = (val: string) => {
    // call onChange with a synthetic event to match previous API
    const ev = { target: { value: val } };
    if (typeof onChange === "function") onChange(ev);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {label && (
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled || !hasOptions} // Disable if no options are available
        onClick={() => setOpen((s) => !s)}
        className={`w-full text-left rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 flex items-center justify-between ${
          disabled || !hasOptions
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <span className="font-normal">{selected}</span>
        <FaChevronDown
          className={`w-3 h-3 ml-2 text-zinc-500 dark:text-zinc-300 transform transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && hasOptions && (
        <div
          className="absolute left-0 mt-2 bg-white dark:bg-zinc-900 rounded-lg z-50 py-1 origin-top-left max-h-60 overflow-y-auto"
          style={{ minWidth: "max-content" }} // Ensures the width adjusts to the longest option
        >
          {extendedOptions.map((opt, idx) => (
            <div
              key={opt.value || `option-${idx}`}
              role="option"
              aria-selected={opt.value === value}
              tabIndex={0}
              onClick={() => handleSelect(opt.value)}
              className={`px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer font-normal ${
                opt.value === "" ? "hidden" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
