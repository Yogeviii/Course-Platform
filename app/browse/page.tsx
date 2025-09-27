// app/browse/page.tsx
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import "@/models/Lesson";               // <-- ensure Lesson model is registered
import CourseCard from "@/components/CourseCard";

export const dynamic = "force-dynamic";

export default async function Browse() {
  await dbConnect();

  const courses = await Course.find({ published: true })
    .populate("lessonsCount")          // virtual count
    // .populate({ path: "lessons", select: "_id", options: { sort: { order: 1 } } }) // optional
    .lean({ virtuals: true });

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-extrabold">Creator Courses</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c: any) => <CourseCard key={c._id} course={c} />)}
      </div>
    </section>
  );
}
