// (no "use client")
import Link from "next/link";

type CourseCardData = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  lessonsCount?: number;
  lessons?: any[];
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  const count =
    typeof course.lessonsCount === "number"
      ? course.lessonsCount
      : Array.isArray(course.lessons)
        ? course.lessons.length
        : 0;

  return (
    <Link href={`/courses/${course._id}`} className="block group">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:shadow-xl">
        {course.thumbnailUrl && (
          <div className="aspect-[16/10] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] opacity-80"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold">{course.title}</h3>
          {course.description && (
            <p className="mt-1 text-sm text-white/70 line-clamp-2">{course.description}</p>
          )}
          <p className="mt-3 text-xs text-white/50">
            {count} lesson{count === 1 ? "" : "s"}
          </p>
        </div>
      </article>
    </Link>
  );
}
