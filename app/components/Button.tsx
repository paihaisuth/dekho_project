"use client";

import React from "react";
import { ImSpinner2 } from "react-icons/im";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

const variantClasses: Record<Variant, string> = {
  primary: "bg-cyan-600 text-white hover:bg-cyan-700",
  secondary:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
  ghost: "bg-transparent text-cyan-600 hover:bg-cyan-50 dark:hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  // increased vertical padding for larger, easier-to-tap buttons
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <ImSpinner2 className={`${className} animate-spin`} />;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={isDisabled} {...rest}>
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
          <span className="sr-only">Loading</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
}

export function IconButton({
  children,
  size = "md",
  variant = "ghost",
  className = "",
  ...rest
}: Omit<ButtonProps, "leftIcon" | "rightIcon">) {
  const sizes: Record<Size, string> = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };

  const classes = `inline-flex items-center justify-center rounded-full ${sizes[size]} ${variantClasses[variant]} cursor-pointer disabled:cursor-not-allowed ${className}`;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
