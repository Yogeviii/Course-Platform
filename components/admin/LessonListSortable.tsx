// components/admin/LessonListSortable.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EditLessonModal from "./EditLessonModal";
import Modal from "@/components/ui/Modal";

type Item = {
  id: string;
  title: string;
  vimeoId?: string;
  order: number;
  thumbnailUrl?: string;
};

export default function LessonListSortable({
  items,
  onReorder,
  onDelete,
  onEdit,
}: {
  items: Item[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
}) {
  const [local, setLocal] = useState<Item[]>(
    [...items].sort((a, b) => a.order - b.order)
  );

  // keep in sync with server
  useEffect(() => {
    setLocal([...items].sort((a, b) => a.order - b.order));
  }, [items]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // confirm-delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  const ids = useMemo(() => local.map((i) => i.id), [local]);

  // ---------- Drag & Drop (whole-row draggable) ----------
  const onRowDragStart = (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    // FF requires some data
    e.dataTransfer.setData("text/plain", id);

    // make the whole row the drag preview
    const li = e.currentTarget;
    e.dataTransfer.setDragImage(li, li.offsetWidth / 3, li.offsetHeight / 2);

    // visual feedback
    li.classList.add("ring-2", "ring-white/30", "opacity-95");
    setDragId(id);
  };

  const onRowDragOver = (overId: string) => (e: React.DragEvent<HTMLLIElement>) => {
    // allow dropping and prevent page dragging
    e.preventDefault();
    e.stopPropagation();

    if (!dragId || dragId === overId) return;

    const from = local.findIndex((i) => i.id === dragId);
    const to = local.findIndex((i) => i.id === overId);
    if (from === -1 || to === -1) return;

    const next = [...local];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLocal(next);
  };

  const finishDrag = async (li?: HTMLLIElement | null) => {
    li?.classList.remove("ring-2", "ring-white/30", "opacity-95");
    if (!dragId) return;
    setDragId(null);
    setSaving(true);
    try {
      await onReorder(local.map((i) => i.id));
    } finally {
      setSaving(false);
    }
  };

  const onRowDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.stopPropagation();
    finishDrag(e.currentTarget);
  };

  const onRowDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.stopPropagation();
    finishDrag(e.currentTarget);
  };
  // -------------------------------------------------------

  // delete flow
  const handleDelete = useCallback(
    async (id: string) => {
      const form = new FormData();
      form.append("id", id);
      setSaving(true);
      try {
        await onDelete(form);
        setLocal((prev) => prev.filter((x) => x.id !== id)); // optimistic
      } finally {
        setSaving(false);
      }
    },
    [onDelete]
  );

  const openConfirm = (id: string, title: string) => {
    setToDelete({ id, title });
    setConfirmOpen(true);
  };
  const confirmAndDelete = async () => {
    if (!toDelete) return;
    await handleDelete(toDelete.id);
    setConfirmOpen(false);
    setToDelete(null);
  };

  return (
    <>
      <ol className="space-y-2">
        {local.map((l, idx) => {
          const thumb =
            l.thumbnailUrl && l.thumbnailUrl.trim()
              ? l.thumbnailUrl
              : l.vimeoId && /^\d+$/.test(l.vimeoId)
              ? `https://vumbnail.com/${l.vimeoId}.jpg`
              : null;

          return (
            <li
              key={l.id}
              draggable
              onDragStart={onRowDragStart(l.id)}
              onDragOver={onRowDragOver(l.id)}
              onDrop={onRowDrop}
              onDragEnd={onRowDragEnd}
              className={[
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2",
                "border border-white/10 bg-black/30",
                "transition hover:bg-black/40",
                "cursor-move select-none", // feel draggable & avoid text selection
              ].join(" ")}
            >
              {/* Left: thumb + title */}
              <div className="flex items-center gap-3 min-w-0">
                {/* tiny handle is now just decorative; whole row drags */}
                <div
                  className="rounded-lg bg-white/10 px-2 py-1 text-xs"
                  aria-hidden
                >
                  ⇅
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      draggable={false}               // prevent image-drag ghost
                      className="h-10 w-16 rounded-lg object-cover opacity-90 pointer-events-none"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded-lg bg-white/5 grid place-items-center text-[10px] text-white/60">
                      No preview
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {idx + 1}. {l.title}
                    </div>
                    {l.vimeoId && (
                      <div className="text-xs text-white/50">vimeo: {l.vimeoId}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2">
                <EditLessonModal
                  initial={{
                    id: l.id,
                    title: l.title,
                    vimeoId: l.vimeoId ?? "",
                    thumbnailUrl: l.thumbnailUrl ?? "",
                  }}
                  onSubmit={onEdit}
                  onSaved={(u) =>
                    setLocal((prev) =>
                      prev.map((x) =>
                        x.id === u.id
                          ? {
                              ...x,
                              title: u.title,
                              vimeoId: u.vimeoId,
                              thumbnailUrl: u.thumbnailUrl,
                            }
                          : x
                      )
                    )
                  }
                  triggerClassName="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/90 transition hover:bg-white/10"
                />

                <button
                  onClick={() => openConfirm(l.id, l.title)}
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
                  aria-label={`Delete ${l.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}

        {local.length === 0 && (
          <li className="rounded-xl bg-black/30 px-3 py-6 text-center text-sm text-white/60">
            No lessons yet. Use “Add lesson”.
          </li>
        )}

        {saving && (
          <div className="pt-2 text-right text-xs text-white/60">Saving…</div>
        )}
      </ol>

      {/* Confirm Delete Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete lesson?"
        width={420}
      >
        <div className="space-y-4">
          <p className="text-sm text-white/80">
            You’re about to delete{" "}
            <span className="font-semibold text-white">{toDelete?.title}</span>.
            This action can’t be undone.
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={confirmAndDelete}
              className="rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:brightness-110"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
