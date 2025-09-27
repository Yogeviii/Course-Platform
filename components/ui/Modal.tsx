// components/ui/Modal.tsx
"use client";

import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
  title,
  width = 560, // px, tweak if you want wider
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
}) {
  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered container */}
      <div className="relative grid h-full w-full place-items-center">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 text-white shadow-2xl"
          style={{ width: `min(92vw, ${width}px)` }}
        >
          {/* Header */}
          {(title || true) && (
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold">{title ?? ""}</h3>
              <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
