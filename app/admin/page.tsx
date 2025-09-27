import AdminGuard from "@/components/AdminGuard";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Link from "next/link";


export default async function AdminHome() {
await dbConnect();
const courses = await Course.find().lean();
return (
<AdminGuard>
<div className="flex items-center justify-between">
<h1 className="text-2xl font-bold">Admin</h1>
<Link href="/admin/courses/new" className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">New Course</Link>
</div>
<ul className="mt-6 space-y-3">
{courses.map((c: any) => (
<li key={c._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
<span>{c.title}</span>
<Link href={`/admin/courses/${c._id}/edit`} className="text-sm underline">Edit</Link>
</li>
))}
</ul>
</AdminGuard>
);
}