// app/browse/page.tsx
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import "@/models/Lesson";
import LessonMiniCard from "@/components/LessonMiniCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LessonLean = {
  _id: string;
  title: string;
  vimeoId: string;
  order: number;
  durationSec?: number;
  thumbnailUrl?: string;
};

type CourseLean = {
  _id: string;
  title: string;
  description?: string;
  lessons?: LessonLean[];
};

export default async function Browse() {
  await dbConnect();

  const courses = (await Course.find({ published: true })
    .populate({
      path: "lessons",
      select: "title vimeoId order durationSec thumbnailUrl",
      options: { sort: { order: 1 } },
    })
    .lean({ virtuals: true })) as unknown as CourseLean[];

  return (
    <section className="space-y-10">
      <h1 className="text-3xl font-extrabold">Creator Courses</h1>

      {courses.map((course) => (
        <div key={String(course._id)} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <Link
              href={`/courses/${course._id}`}
              className="text-sm text-white/70 underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {/* horizontal scroller of lessons */}
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {(course.lessons ?? []).map((l) => {
              const thumb =
                l.thumbnailUrl && l.thumbnailUrl.trim().length > 0
                  ? l.thumbnailUrl
                  : /^\d+$/.test(l.vimeoId)
                  ? `https://vumbnail.com/${l.vimeoId}.jpg`
                  : undefined;

            return (
              <LessonMiniCard
                key={String(l._id)}
                courseId={String(course._id)}
                lessonId={String(l._id)}
                title={l.title}
                thumb={thumb}
                duration={l.durationSec}
              />
            );
            })}
            {(course.lessons ?? []).length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-white/60">
                No lessons yet.
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
