// components/ui/Modal.tsx
"use client";

import { useEffect, useRef } from "react";

export default function Modal({
  open,
  onClose,
  children,
  title,
  width = 560, // px
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={[
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        "transition-opacity duration-150",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop (opaque, no blur → no glow/halo) */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal panel (perfectly centered) */}
      <div
        ref={containerRef}
        className={[
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[min(92vw,var(--modal-w))]",
          "rounded-2xl border border-white/10 bg-neutral-900 text-white shadow-2xl",
          "animate-[modalIn_160ms_ease-out]",
        ].join(" ")}
        style={{ ["--modal-w" as any]: `${width}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold">{title ?? ""}</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Close
          </button>
        </div>

        {/* Body (scrolls if tall; keeps footer buttons crisp) */}
        <div className="max-h-[calc(100vh-10rem)] overflow-auto p-4">
          {children}
        </div>
      </div>

      {/* Tiny keyframes for a subtle pop-in */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -46%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}
