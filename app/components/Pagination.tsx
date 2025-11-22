"use client";

import React, { useEffect, useState } from "react";
import Button from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  /**
   * When true (default) the bar shows only when user is near bottom or
   * when content doesn't scroll. When false it is always visible.
   */
  autoShow?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  autoShow = true,
}: PaginationProps) {
  const [visible, setVisible] = useState(!autoShow);

  useEffect(() => {
    if (!autoShow) {
      return;
    }

    function checkScroll() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || window.pageYOffset;
      const innerH = window.innerHeight;
      const scrollHeight = doc.scrollHeight;

      const nearBottom = scrollTop + innerH >= scrollHeight - 120;
      const noScroll = scrollHeight <= innerH + 10;

      setVisible(nearBottom || noScroll);
    }

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [autoShow]);

  return (
    <div
      className={`fixed bottom-20 left-0 right-0 flex justify-center items-center gap-4 transition-transform duration-200 ease-in-out transform z-40 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <Button
        onClick={onPrevious}
        disabled={page === 1}
        variant="secondary"
        size="sm"
      >
        Previous
      </Button>

      <span className="text-sm text-zinc-600 dark:text-zinc-300">
        Page {page} of {totalPages}
      </span>

      <Button
        onClick={onNext}
        disabled={page === totalPages}
        variant="secondary"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}
