"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

export default function EditLessonModal({
  initial,
  onSubmit, // server action
  onSaved,  // ✅ new optional callback for optimistic UI
  triggerClassName,
}: {
  initial: { id: string; title: string; vimeoId: string; thumbnailUrl?: string };
  onSubmit: (fd: FormData) => Promise<void>;
  onSaved?: (u: { id: string; title: string; vimeoId: string; thumbnailUrl?: string }) => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs transition hover:bg-white/10"}
      >
        Edit
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit lesson" width={480}>
        <form
          action={async (fd) => {
            // attach id & normalize vimeo
            fd.set("id", initial.id);
            const raw = String(fd.get("vimeoId") ?? "");
            fd.set("vimeoId", raw.replace(/[^0-9]/g, ""));

            await onSubmit(fd);

            // Optimistic update (no full page refresh required)
            if (onSaved) {
              onSaved({
                id: initial.id,
                title: String(fd.get("title") ?? initial.title),
                vimeoId: String(fd.get("vimeoId") ?? initial.vimeoId),
                thumbnailUrl: String(fd.get("thumbnailUrl") ?? initial.thumbnailUrl ?? ""),
              });
            }

            // Also ensure SSR data is fresh for next open
            startTransition(() => router.refresh());
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
            <label className="text-xs text-white/70">Vimeo URL or ID</label>
            <input
              name="vimeoId"
              defaultValue={initial.vimeoId}
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
              required
            />
            <p className="text-[11px] text-white/45">We’ll extract the numeric ID automatically.</p>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Thumbnail URL (optional)</label>
            <input
              name="thumbnailUrl"
              defaultValue={initial.thumbnailUrl ?? ""}
              placeholder="https://…"
              className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none ring-0 focus:bg-black/40"
            />
          </div>

          <div className="pt-2 text-right">
            <button
              disabled={isPending}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow transition hover:shadow-lg disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
