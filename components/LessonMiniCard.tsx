// components/LessonMiniCard.tsx
"use client";

import Link from "next/link";

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
  duration?: number;
}) {
  return (
    <Link
      href={`/courses/${courseId}?l=${lessonId}`}
      prefetch={false}
      className="group w-[260px] shrink-0"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full w-full place-items-center text-white/60">No thumbnail</div>
        )}
        {typeof duration === "number" && duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-2 truncate text-sm text-white/90">{title}</div>
    </Link>
  );
}
