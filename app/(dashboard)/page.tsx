import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import CourseCard from "@/components/CourseCard";


export const dynamic = "force-dynamic";


export default async function Dashboard() {
await dbConnect();
const courses = await Course.find({ published: true }).populate("lessons").lean();
return (
<section className="space-y-8">
<h1 className="text-3xl font-extrabold">Creator Courses</h1>
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
{courses.map((c: any) => <CourseCard key={c._id} course={c} />)}
</div>
</section>
);
}