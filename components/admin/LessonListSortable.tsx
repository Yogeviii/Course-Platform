"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";

type Item = {
  id: string;
  title: string;
  vimeoId?: string;
  order: number;
};

export default function LessonListSortable({
  items,
  onReorder,
  onDelete,
}: {
  items: Item[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  const [local, setLocal] = useState<Item[]>([...items].sort((a, b) => a.order - b.order));
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 🔑 stable signature of incoming items (id:order) so we know when to resync
  const signature = useMemo(
    () => items.map((i) => `${i.id}:${i.order}`).join(","),
    [items]
  );

  // ✅ resync local state when server-side items change (after router.refresh)
  useEffect(() => {
    setLocal([...items].sort((a, b) => a.order - b.order));
  }, [signature, items]);

  const handleDragStart = (id: string) => () => setDragId(id);

  const handleDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;

    const from = local.findIndex((i) => i.id === dragId);
    const to = local.findIndex((i) => i.id === overId);
    if (from === -1 || to === -1) return;

    const next = [...local];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocal(next);
  };

  const handleDrop = async () => {
    if (!dragId) return;
    setDragId(null);
    setSaving(true);
    try {
      await onReorder(local.map((i) => i.id));
      startTransition(() => router.refresh()); // pull fresh data
    } finally {
      setSaving(false);
    }
  };

  const openConfirm = useCallback((id: string, title: string) => {
    setPendingDelete({ id, title });
    setConfirmOpen(true);
  }, []);

  const doDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const form = new FormData();
    form.append("id", pendingDelete.id);

    // optimistic removal
    setLocal((prev) => prev.filter((i) => i.id !== pendingDelete.id));

    setSaving(true);
    setConfirmOpen(false);
    try {
      await onDelete(form);
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
      setPendingDelete(null);
    }
  }, [onDelete, pendingDelete, router]);

  return (
    <>
      <ol className="space-y-2">
        {local.map((l, idx) => {
          const active = dragId === l.id;
          const hasThumb = l.vimeoId && /^\d+$/.test(l.vimeoId);
          const thumb = hasThumb ? `https://vumbnail.com/${l.vimeoId}.jpg` : null;

          return (
            <li
              key={l.id}
              draggable
              onDragStart={handleDragStart(l.id)}
              onDragOver={handleDragOver(l.id)}
              onDrop={handleDrop}
              className={[
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2",
                "border border-white/10 bg-black/30",
                "transition",
                active ? "ring-2 ring-white/30" : "hover:bg-black/40",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="cursor-grab select-none rounded-lg bg-white/10 px-2 py-1 text-xs">⇅</div>

                <div className="flex min-w-0 items-center gap-3">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-10 w-16 rounded-lg object-cover opacity-90" />
                  ) : (
                    <div className="grid h-10 w-16 place-items-center rounded-lg bg-white/5 text-[10px] text-white/60">
                      No preview
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {idx + 1}. {l.title}
                    </div>
                    {l.vimeoId && <div className="text-xs text-white/50">vimeo: {l.vimeoId}</div>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openConfirm(l.id, l.title)}
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}

        {local.length === 0 && (
          <li className="rounded-xl bg-black/30 px-3 py-6 text-center text-sm text-white/60">
            No lessons yet. Add your first one using <span className="font-medium">Add lesson</span>.
          </li>
        )}

        {(saving || isPending) && (
          <div className="pt-2 text-right text-xs text-white/60">Saving…</div>
        )}
      </ol>

      {/* Confirm modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete lesson?" width={440}>
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            This will permanently remove{" "}
            <span className="font-semibold text-white/90">{pendingDelete?.title}</span> from the course.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={doDelete}
              className="rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
