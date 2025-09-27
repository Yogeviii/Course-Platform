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
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
      >
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
