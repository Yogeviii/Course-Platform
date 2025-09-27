import AdminGuard from "@/components/AdminGuard";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import LessonListSortable from "@/components/admin/LessonListSortable";
import EditCourseModal from "@/components/admin/EditCourseModal";
import AddLessonModal from "@/components/admin/AddLessonModal";
import Link from "next/link";

type CourseLean = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  published?: boolean;
};

type LessonLean = {
  _id: string;
  course: string;
  title: string;
  vimeoId: string;
  order: number;
};

type ParamsPromise = Promise<{ id: string }>;

interface Props {
  params: ParamsPromise; // Next 15: await params
}

export const dynamic = "force-dynamic";

export default async function EditCourse({ params }: Props) {
  await dbConnect();
  const { id } = await params;

  const course = await Course.findById(id).lean<CourseLean | null>();
  if (!course) notFound();

  const lessons = await Lesson.find({ course: id })
    .sort({ order: 1 })
    .lean<LessonLean[]>();

  // ---------- Server actions ----------
  async function updateCourse(formData: FormData) {
    "use server";
    await dbConnect();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
    const published = formData.get("published") === "on";
    await Course.updateOne(
      { _id: id },
      { $set: { title, description, thumbnailUrl, published } }
    );
    revalidatePath(`/admin/courses/${id}/edit`);
  }

  async function addLesson(formData: FormData) {
    "use server";
    await dbConnect();
    const title = String(formData.get("title") ?? "").trim();
    const raw = String(formData.get("vimeoId") ?? "");
    const vimeoId = raw.replace(/[^0-9]/g, "");
    if (!title || !vimeoId) return;
    const order = await Lesson.countDocuments({ course: id });
    const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
    await Lesson.create({ course: id, title, vimeoId, order, thumbnailUrl });

    revalidatePath(`/admin/courses/${id}/edit`);
  }

  async function updateLesson(formData: FormData) {
    "use server";
    await dbConnect();
    const lid = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const raw = String(formData.get("vimeoId") ?? "");
    const vimeoId = raw.replace(/[^0-9]/g, "");
    if (!lid || !title || !vimeoId) return;
    await Lesson.updateOne({ _id: lid, course: id }, { $set: { title, vimeoId } });
    revalidatePath(`/admin/courses/${id}/edit`);
  }

  async function deleteLesson(formData: FormData) {
    "use server";
    await dbConnect();
    const lid = String(formData.get("id") ?? "");
    if (!lid) return;
    await Lesson.deleteOne({ _id: lid, course: id });

    // Compact order after delete
    const remaining = await Lesson.find({ course: id })
      .sort({ order: 1 })
      .select("_id")
      .lean();
    await Lesson.bulkWrite(
      remaining.map((l, idx) => ({
        updateOne: { filter: { _id: l._id }, update: { $set: { order: idx } } },
      }))
    );
    revalidatePath(`/admin/courses/${id}/edit`);
  }

  async function saveOrder(newOrder: string[]) {
    "use server";
    await dbConnect();
    await Lesson.bulkWrite(
      newOrder.map((lid, idx) => ({
        updateOne: { filter: { _id: lid, course: id }, update: { $set: { order: idx } } },
      }))
    );
    revalidatePath(`/admin/courses/${id}/edit`);
  }
  // ------------------------------------

  // Safe props for client components
  const items = lessons.map((l) => ({
    id: String(l._id),
    title: l.title,
    vimeoId: l.vimeoId,
    order: l.order,
  }));
  const count = items.length;

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-[16/6] w-full">
            {course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnailUrl}
                alt="Course cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-900 to-black text-white/50">
                No thumbnail yet
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold">
                      {course.title || "Untitled course"}
                    </h1>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        course.published
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {course.published ? "Published" : "Draft"}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
                      {count} lesson{count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {course.description && (
                    <p className="mt-1 max-w-3xl text-sm text-white/70 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course._id}`}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
                  >
                    Preview
                  </Link>
                  <EditCourseModal
                    initial={{
                      title: course.title || "",
                      description: course.description || "",
                      thumbnailUrl: course.thumbnailUrl || "",
                      published: !!course.published,
                    }}
                    onSubmit={updateCourse}
                  />
                
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons panel */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="sticky top-16 z-10 flex items-center justify-between border-b border-white/10 bg-white/5/80 px-4 py-3 backdrop-blur">
            <h2 className="font-semibold">Lessons</h2>
            <div className="flex items-center gap-2">
              {/* 👉 Put Add lesson right here for discoverability */}
              <AddLessonModal onSubmit={addLesson} />
            </div>
          </div>

          <div className="p-4">
            <LessonListSortable
              items={items}
              onReorder={saveOrder}
              onDelete={deleteLesson}
              onEdit={updateLesson}
            />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
