// components/LessonMiniCard.tsx
"use client";

import Link from "next/link";

function formatDuration(totalSec?: number) {
  if (!totalSec || totalSec <= 0) return null;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function LessonMiniCard({
  courseId,
  lessonId,
  title,
  thumb,
  duration,
}: {
  courseId: string;
  lessonId: string;
  title: string;
  thumb?: string | null;
  duration?: number; // seconds (Lesson.durationSec)
}) {
  const time = formatDuration(duration);

  return (
    <Link
      href={`/courses/${courseId}?l=${lessonId}`}
      prefetch={false}
      className="group w-[260px] shrink-0"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-white/60">
            No thumbnail
          </div>
        )}

        {/* soft gradient for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />

        {/* play pill + duration */}
        <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5">
          {time && (
            <span className="rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white/95 shadow-sm">
              {time}
            </span>
          )}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-black shadow-sm transition-transform group-hover:scale-105">
            {/* play icon */}
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-2 line-clamp-2 text-sm text-white/90">{title}</div>
    </Link>
  );
}
