"use client";

import { useEffect, useRef, useState, useTransition } from "react";

export default function LessonStatsBar({
  lessonId,
  lessonTitle,
}: { lessonId: string; lessonTitle: string }) {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  // prevent double /view during React StrictMode re-mounts
  const viewSentRef = useRef(false);

  // tiny “pop” animation when the user likes
  const [justLiked, setJustLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    viewSentRef.current = false;

    async function run() {
      // 1) increment view ONCE
      if (!viewSentRef.current) {
        viewSentRef.current = true;
        try {
          const v = await fetch(`/api/lessons/${lessonId}/view`, {
            method: "POST",
            cache: "no-store",
          }).then((r) => r.json());
          if (!cancelled) {
            setViews(v.views ?? 0);
            setLikes(v.likesCount ?? 0);
          }
        } catch {}
      }

      // 2) fetch latest stats + liked
      try {
        const s = await fetch(`/api/lessons/${lessonId}/stats`, {
          cache: "no-store",
        }).then((r) => (r.ok ? r.json() : null));
        if (!cancelled && s) {
          setViews(s.views ?? 0);
          setLikes(s.likesCount ?? 0);
          setLiked(!!s.liked);
        }
      } catch {}
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // optional keyboard shortcut: press “L” to like/unlike
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggleLike();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, liked]); // rebind per lesson

  async function toggleLike() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/like`, {
          method: "POST",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const nowLiked = !!data.liked;
          setLiked(nowLiked);
          setLikes(data.likesCount ?? likes);
          if (nowLiked) {
            setJustLiked(true);
            setTimeout(() => setJustLiked(false), 260);
          }
        }
      } catch {}
    });
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      {/* Title */}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{lessonTitle}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm">
        {/* Views pill */}
        <span
          className="hidden sm:inline-flex select-none items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-white/80"
          title={`${views.toLocaleString()} views`}
          aria-label={`${views.toLocaleString()} views`}
        >
          {/* eye icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" aria-hidden>
            <path fill="currentColor" d="M12 5c5.05 0 9.27 3.11 10.73 7.5C21.27 16.89 17.05 20 12 20S2.73 16.89 1.27 12.5C2.73 8.11 6.95 5 12 5m0 2C8.14 7 4.92 9.06 3.64 12.5C4.92 15.94 8.14 18 12 18s7.08-2.06 8.36-5.5C19.08 9.06 15.86 7 12 7m0 2a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7Z"/>
          </svg>
          {views.toLocaleString()}
        </span>

        {/* Like button */}
        <button
          onClick={toggleLike}
          disabled={isPending}
          title={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          aria-label={`${likes.toLocaleString()} ${liked ? "likes (liked)" : "likes"}`}
          className={[
            "group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
            "transition shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40",
            liked
              ? "bg-rose-500 text-white hover:bg-rose-500/90"
              : "bg-white/10 text-white/90 hover:bg-white/20",
            isPending ? "opacity-70" : "",
            justLiked ? "scale-[1.05]" : "scale-100",
          ].join(" ")}
        >
          {/* thumb icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className={[
              "transition-transform",
              liked ? "scale-110" : "scale-100 opacity-90",
            ].join(" ")}
            aria-hidden
          >
            {liked ? (
              // filled
              <path
                fill="currentColor"
                d="M1 21h4V9H1v12Zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57l.03-.32c0-.41-.17-.79-.44-1.06L14 1L7.59 7.41C7.22 7.78 7 8.3 7 8.83V19c0 1.1.9 2 2 2h7c.82 0 1.54-.5 1.84-1.22L22.72 12.8c.18-.37.28-.78.28-1.2Z"
              />
            ) : (
              // outline
              <path
                fill="currentColor"
                d="M9 21h7c.82 0 1.54-.5 1.84-1.22L22.72 12.8c.18-.37.28-.78.28-1.2c0-1.1-.9-2-2-2h-6.31l.95-4.57l.03-.32c0-.41-.17-.79-.44-1.06L14 1L7.59 7.41C7.22 7.78 7 8.3 7 8.83V19c0 1.1.9 2 2 2Zm-8 0h4V9H1v12Z"
              />
            )}
          </svg>

          {/* label that adapts */}
          <span className="tabular-nums">
            {likes.toLocaleString()}
          </span>
          <span className="hidden sm:inline">{liked ? "Liked" : "Like"}</span>
        </button>
      </div>
    </div>
  );
}
