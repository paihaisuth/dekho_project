"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

let GLOBAL_MODAL_PORTAL: HTMLElement | null = null;

function getGlobalModalPortal(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  if (!GLOBAL_MODAL_PORTAL) {
    GLOBAL_MODAL_PORTAL = document.createElement("div");
    GLOBAL_MODAL_PORTAL.setAttribute("data-modal-portal", "");
    document.body.appendChild(GLOBAL_MODAL_PORTAL);
  }
  return GLOBAL_MODAL_PORTAL;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const container = getGlobalModalPortal();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  if (!container) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        // close when clicking on overlay only
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 rounded-2xl shadow-2xl transform transition-all`}
        style={{ zIndex: 60 }}
      >
        <div className="overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </div>
            {showCloseButton && (
              <button
                aria-label="Close modal"
                onClick={onClose}
                className="text-zinc-600 cursor-pointer dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 transition p-1 rounded"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="p-6 text-zinc-700 dark:text-zinc-200">{children}</div>
        </div>
      </div>
    </div>,
    container
  );
}

// Convenience hook for toggling modal state
export function useModal(initial = false) {
  const [open, setOpen] = useState<boolean>(initial);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((s) => !s), []);
  return { open, openModal, closeModal, toggle } as const;
}
