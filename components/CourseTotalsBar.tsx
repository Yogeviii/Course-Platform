// components/CourseTotalsBar.tsx
"use client";

import { useEffect, useState } from "react";

function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "K";
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 >= 100_000 ? 1 : 0) + "M";
  return (n / 1_000_000_000).toFixed(1) + "B";
}

export default function CourseTotalsBar({
  initialViews,
  initialLikes,
}: {
  initialViews: number;
  initialLikes: number;
}) {
  const [views, setViews] = useState(initialViews);
  const [likes, setLikes] = useState(initialLikes);

  useEffect(() => {
    function onChange(e: Event) {
      const detail = (e as CustomEvent).detail as { viewsDelta?: number; likesDelta?: number };
      if (typeof detail?.viewsDelta === "number") setViews((v) => Math.max(0, v + detail.viewsDelta!));
      if (typeof detail?.likesDelta === "number") setLikes((l) => Math.max(0, l + detail.likesDelta!));
    }
    window.addEventListener("lesson-stats-changed", onChange as EventListener);
    return () => window.removeEventListener("lesson-stats-changed", onChange as EventListener);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">
        {formatCount(views)} total views
      </span>
      <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">
        {formatCount(likes)} total likes
      </span>
    </div>
  );
}
