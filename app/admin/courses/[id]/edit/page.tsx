import AdminGuard from "@/components/AdminGuard";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

type CourseLean = {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
};

type LessonLean = {
  _id: string;
  course: string;
  title: string;
  vimeoId: string;
  order: number;
};

interface Props { params: { id: string } }

export default async function EditCourse({ params }: Props) {
  await dbConnect();

  // Guard null and narrow the type
  const course = await Course.findById(params.id).lean<CourseLean | null>();
  if (!course) notFound();

  // Capture plain values (avoid closure re-widening to null)
  const courseId = course._id;
  const courseTitle = course.title;

  // Strongly type lessons as an array
  const lessons = await Lesson.find({ course: params.id })
    .sort({ order: 1 })
    .lean<LessonLean[]>();

  // Server Action lives in the same file but uses captured primitives
  async function addLesson(formData: FormData) {
    "use server";
    await dbConnect();

    const title = String(formData.get("title") ?? "");
    const raw = String(formData.get("vimeoId") ?? "");
    const vimeoId = raw.replace(/[^0-9]/g, ""); // normalize URL → numeric ID

    // Compute order fresh (don’t rely on captured lessons.length)
    const order = await Lesson.countDocuments({ course: courseId });

    await Lesson.create({ course: courseId, title, vimeoId, order });

    // Revalidate so the new lesson appears immediately
    revalidatePath(`/admin/courses/${params.id}/edit`);
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h1 className="text-xl font-bold">Edit: {courseTitle}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <form action={addLesson} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold">Add Lesson</h2>
            <input
              name="title"
              placeholder="Lesson title"
              className="w-full rounded-xl bg-black/30 px-3 py-2"
              required
            />
            <input
              name="vimeoId"
              placeholder="Vimeo URL or ID"
              className="w-full rounded-xl bg-black/30 px-3 py-2"
              required
            />
            <button className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Add</button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 font-semibold">Lessons (drag to reorder soon)</h2>
            <ol className="space-y-2">
              {lessons.map((l, i) => (
                <li key={l._id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
                  <span>{i + 1}. {l.title}</span>
                  {/* Add delete/edit actions as needed */}
                </li>
              ))}
              {lessons.length === 0 && (
                <li className="text-sm text-white/60">No lessons yet. Add your first one on the left.</li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
