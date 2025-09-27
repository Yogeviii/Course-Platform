"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

export default function EditCourseModal({
  initial,
  onSubmit, // server action
}: {
  initial: { title: string; description: string; thumbnailUrl: string; published: boolean };
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-black shadow-sm transition hover:shadow-lg"
      >
        Edit details
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit course" width={560}>
        <form
          action={async (fd) => {
            await onSubmit(fd);                 // update + revalidatePath
            startTransition(() => router.refresh()); // pull fresh data
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <label className="text-xs text-white/70">Title</label>
            <input
              name="title"
              defaultValue={initial.title}
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Description</label>
            <textarea
              name="description"
              defaultValue={initial.description}
              rows={4}
              className="w-full resize-none rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Thumbnail URL</label>
            <input
              name="thumbnailUrl"
              defaultValue={initial.thumbnailUrl}
              placeholder="https://…"
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
            />
            <p className="text-xs text-white/50">Use a 16:9 image for best fit.</p>
          </div>

          <label className="mt-1 flex items-center gap-2 text-xs text-white/80">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initial.published}
              className="h-4 w-4 rounded border-white/20 bg-black/30"
            />
            Published (visible to users)
          </label>

          <div className="pt-2 text-right">
            <button
              disabled={isPending}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow transition hover:shadow-lg disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
