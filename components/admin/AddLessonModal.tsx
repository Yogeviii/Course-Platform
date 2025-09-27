// components/admin/AddLessonModal.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

export default function AddLessonModal({
  onSubmit,
}: {
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
    onClick={() => setOpen(true)}
    aria-label="Add lesson"
    className={[
      "group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
      "bg-gradient-to-br from-emerald-400 to-cyan-400 text-black",
      "shadow-[0_8px_24px_rgba(16,185,129,0.35)]",
      "transition-transform duration-200 ease-out hover:scale-[1.03]",
      "focus:outline-none focus:ring-4 focus:ring-emerald-400/30",
      "active:scale-[0.98]"
    ].join(" ")}
  >
    {/* plus icon */}
    <span className="grid h-5 w-5 place-items-center rounded-full bg-black/10 text-black/80 transition-colors group-hover:bg-black/15">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
    Add lesson
  </button>


      <Modal open={open} onClose={() => setOpen(false)} title="Add lesson" width={480}>
        <form
          action={async (fd) => {
            await onSubmit(fd);
            startTransition(() => router.refresh());
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <label className="text-xs text-white/70">Lesson title</label>
            <input name="title" className="w-full rounded-xl bg-black/30 px-3 py-2" required />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Vimeo URL or ID</label>
            <input name="vimeoId" className="w-full rounded-xl bg-black/30 px-3 py-2" required />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Thumbnail URL (optional)</label>
            <input name="thumbnailUrl" placeholder="https://…" className="w-full rounded-xl bg-black/30 px-3 py-2" />
            <p className="text-xs text-white/50">If empty, we’ll fallback to a Vimeo frame.</p>
          </div>

          <div className="pt-2 text-right">
            <button disabled={isPending} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
              {isPending ? "Adding…" : "Add lesson"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
