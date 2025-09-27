// app/admin/page.tsx  (or wherever your AdminHome lives)
import AdminGuard from "@/components/AdminGuard";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import "@/models/Lesson"; // ensure Lesson model is registered for populate
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await dbConnect();

  const courses = await Course.find({})
    .sort({ updatedAt: -1 })
    .populate("lessonsCount")
    .lean({ virtuals: true });

  return (
    <AdminGuard>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Courses</h1>
          <p className="mt-1 text-sm text-white/60">
            Create, edit, and manage your lessons.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="rounded-xl bg-white px-4 py-2 font-semibold text-black shadow-md transition hover:shadow-lg"
        >
          + New course
        </Link>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="grid place-items-center rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
          <h2 className="text-lg font-semibold">No courses yet</h2>
          <p className="mt-2 max-w-md text-sm text-white/70">
            Get started by creating your first course. You can add lessons, set
            the order, and update thumbnails anytime.
          </p>
          <Link
            href="/admin/courses/new"
            className="mt-6 rounded-xl bg-white px-4 py-2 font-semibold text-black shadow-md transition hover:shadow-lg"
          >
            Create course
          </Link>
        </div>
      )}

      {/* Grid */}
      {courses.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c: any) => {
            const count =
              typeof c.lessonsCount === "number"
                ? c.lessonsCount
                : Array.isArray(c.lessons)
                ? c.lessons.length
                : 0;

            return (
              <li
                key={String(c._id)}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:shadow-xl"
              >
                {/* Thumb */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  {c.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.thumbnailUrl}
                      alt={c.title ?? "Course thumbnail"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] opacity-85"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/60">
                      No thumbnail
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        c.published
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {c.published ? "Published" : "Draft"}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
                      {count} lesson{count === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Quick edit button (appears on hover) */}
                  <Link
                    href={`/admin/courses/${c._id}/edit`}
                    className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-1.5 text-sm font-semibold text-black shadow-md opacity-0 transition group-hover:opacity-100"
                  >
                    Edit
                  </Link>
                </div>

                {/* Meta */}
                <div className="p-4">
                  <h3 className="font-semibold">
                    {c.title || "Untitled course"}
                  </h3>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/70">
                      {c.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/courses/${c._id}`}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/admin/courses/${c._id}/edit`}
                      className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black shadow-sm transition hover:shadow-lg"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminGuard>
  );
}
