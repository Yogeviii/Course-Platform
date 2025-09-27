"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

export default function AddLessonModal({
  onSubmit, // server action
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
            await onSubmit(fd);              // calls server action (creates lesson + revalidatePath)
            startTransition(() => router.refresh()); // refetch server components without navigation
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <label className="text-xs text-white/70">Lesson title</label>
            <input
              name="title"
              placeholder="Intro / Setup / Lesson 1"
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Vimeo URL or ID</label>
            <input
              name="vimeoId"
              placeholder="https://vimeo.com/12345678 or 12345678"
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
              required
            />
          </div>

          <div className="pt-2 text-right">
            <button
              disabled={isPending}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow transition hover:shadow-lg disabled:opacity-60"
            >
              {isPending ? "Adding…" : "Add lesson"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
