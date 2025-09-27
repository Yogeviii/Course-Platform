// components/admin/LessonListSortable.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EditLessonModal from "./EditLessonModal";
import Modal from "@/components/ui/Modal";

// 👇 Add analytics fields (optional so you can adopt gradually)
type Item = {
  id: string;
  title: string;
  vimeoId?: string;
  order: number;
  thumbnailUrl?: string;
  views?: number;
  likesCount?: number;
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

  useMemo(() => local.map((i) => i.id), [local]); // keep

  // ---------- Drag & Drop (whole-row draggable) ----------
  const onRowDragStart = (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // required for FF
    const li = e.currentTarget;
    e.dataTransfer.setDragImage(li, li.offsetWidth / 3, li.offsetHeight / 2);
    li.classList.add("ring-2", "ring-white/30", "opacity-95");
    setDragId(id);
  };

  const onRowDragOver = (overId: string) => (e: React.DragEvent<HTMLLIElement>) => {
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

  // helpers
  const fmt = (n?: number) =>
    (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

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
                "flex items-center justify-between gap-4 rounded-xl px-3 py-2",
                "border border-white/10 bg-black/30",
                "transition hover:bg-black/40",
                "cursor-move select-none",
              ].join(" ")}
            >
              {/* Left: thumb + title/meta */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="rounded-lg bg-white/10 px-2 py-1 text-xs"
                  aria-hidden
                  title="Drag row to reorder"
                >
                  ⇅
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      draggable={false}
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
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                      {l.vimeoId && <span>vimeo: {l.vimeoId}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Analytics pills */}
              <div className="hidden sm:flex items-center gap-2">
                <StatPill
                  icon={
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                      <path
                        fill="currentColor"
                        d="M12 5c5.23 0 9.27 4.11 10 7-0.73 2.89-4.77 7-10 7S2.73 14.89 2 12C2.73 9.11 6.77 5 12 5Zm0 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                    </svg>
                  }
                  label={`${fmt(l.views)} views`}
                />
                <StatPill
                  accent="rose"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                      <path
                        fill="currentColor"
                        d="M2 21h4V9H2v12Zm6 0h5.17c.53 0 1.04-.21 1.41-.59l5.24-5.24c.38-.38.59-.88.59-1.41V11a2 2 0 0 0-2-2h-4.31l.76-3.59.03-.32a1 1 0 0 0-.29-.71L13.41 3 8 8.41V21Z"
                      />
                    </svg>
                  }
                  label={`${fmt(l.likesCount)} likes`}
                />
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

/** Small, glossy stat chip */
function StatPill({
  icon,
  label,
  accent = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  accent?: "slate" | "rose" | "emerald" | "violet";
}) {
  const base =
    accent === "rose"
      ? "from-rose-500/15 to-rose-500/5 text-rose-200 border-rose-500/20"
      : accent === "emerald"
      ? "from-emerald-500/15 to-emerald-500/5 text-emerald-200 border-emerald-500/20"
      : accent === "violet"
      ? "from-violet-500/15 to-violet-500/5 text-violet-200 border-violet-500/20"
      : "from-white/10 to-white/5 text-white/80 border-white/15";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium",
        "bg-gradient-to-br",
        base,
      ].join(" ")}
      title={label}
    >
      <span className="opacity-90">{icon}</span>
      <span className="leading-none">{label}</span>
    </span>
  );
}
