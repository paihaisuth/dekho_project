"use client";

import React, { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

type Props = {
  label?: string;
  showToggle?: boolean; // show password visibility toggle when type==='password'
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  showToggle,
  type,
  className,
  disabled,
  value,
  defaultValue,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const inputType =
    type === "password" && showToggle
      ? visible
        ? "text"
        : "password"
      : type || "text";

  const handleToggle = () => {
    setVisible((s) => !s);
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...rest}
          type={inputType}
          disabled={disabled}
          value={value ?? ""}
          className={`w-full rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 pr-10 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${className || ""}`}
        />

        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 disabled:opacity-50"
          >
            {visible ? (
              <HiEyeOff
                className={`w-5 h-5 transform transition-transform duration-150 ${
                  isPressed ? "scale-90" : "scale-100"
                }`}
              />
            ) : (
              <HiEye
                className={`w-5 h-5 transform transition-transform duration-150 ${
                  isPressed ? "scale-90" : "scale-100"
                }`}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
