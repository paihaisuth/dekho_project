"use client";

type Props = {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  overlay?: boolean;
};

const sizeMap: Record<string, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-7 h-7 border-2",
};

export default function Loading({
  size = "md",
  text,
  className = "",
  overlay = false,
}: Props) {
  const spinner = (
    <span
      className={`${sizeMap[size]} rounded-full border-solid border-cyan-600 border-t-transparent animate-[spin_1.2s_linear_infinite]`}
      aria-hidden
    />
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="rounded-full bg-white/70 dark:bg-zinc-900/70 p-3 flex items-center justify-center">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {spinner}
      {text && (
        <span className="text-sm text-zinc-900 dark:text-zinc-50">{text}</span>
      )}
    </span>
  );
}
