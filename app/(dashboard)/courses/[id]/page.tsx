// app/(dashboard)/courses/[id]/page.tsx
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import VideoPlayer from "@/components/VideoPlayer";
import { notFound } from "next/navigation";

type CourseLean = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
};

type LessonLean = {
  _id: string;       // will compare as string via String(_id)
  course: string;
  title: string;
  vimeoId: string;
  order: number;
};

type ParamsPromise = Promise<{ id: string }>;
type SearchPromise = Promise<{ l?: string }>;

interface Props {
  params: ParamsPromise;
  searchParams: SearchPromise;
}

export const dynamic = "force-dynamic";

export default async function CoursePage({ params, searchParams }: Props) {
  await dbConnect();

  // ⬇️ Next 15: await the dynamic APIs
  const { id } = await params;
  const sp = await searchParams;

  const course = await Course.findById(id).lean<CourseLean | null>();
  if (!course) notFound();

  const lessons = await Lesson.find({ course: id })
    .sort({ order: 1 })
    .lean<LessonLean[]>();

  const current =
    lessons.find((x) => String(x._id) === (sp.l ?? "")) ??
    (lessons.length ? lessons[0] : null);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Left: player + info */}
      <div className="space-y-4">
        {current ? (
          <VideoPlayer vimeoId={current.vimeoId} />
        ) : (
          <div className="aspect-video w-full rounded-2xl border border-white/10 bg-black/40 grid place-items-center text-white/60">
            No lessons yet.
          </div>
        )}

        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="text-white/70">{course.description}</p>
        )}
      </div>

      {/* Right: lesson list */}
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 max-h-[80vh] overflow-auto">
        <h2 className="mb-3 font-semibold">Lessons</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-white/60">No lessons have been added yet.</p>
        ) : (
          <ol className="space-y-2">
            {lessons.map((l, i) => {
              const active = current && String(l._id) === String(current._id);
              return (
                <li key={String(l._id)}>
                  <a
                    href={`?l=${String(l._id)}`}
                    className={`block rounded-xl px-3 py-2 transition hover:bg-white/10 ${
                      active ? "bg-white/10" : ""
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {i + 1}. {l.title}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        )}
      </aside>
    </div>
  );
}
