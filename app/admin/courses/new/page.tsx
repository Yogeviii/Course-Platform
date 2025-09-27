import AdminGuard from "@/components/AdminGuard";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import { redirect } from "next/navigation";


export default async function NewCoursePage() {
async function create(formData: FormData) {
"use server";
await dbConnect();
const title = String(formData.get("title"));
const description = String(formData.get("description")||"");
const thumbnailUrl = String(formData.get("thumbnailUrl")||"");
const course = await Course.create({ title, description, thumbnailUrl });
redirect(`/admin/courses/${course._id}/edit`);
}


return (
<AdminGuard>
<form action={create} className="mx-auto max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
<h1 className="text-xl font-bold">Create Course</h1>
<input name="title" placeholder="Title" required className="w-full rounded-xl bg-black/30 px-3 py-2"/>
<textarea name="description" placeholder="Description" className="w-full rounded-xl bg-black/30 px-3 py-2"/>
<input name="thumbnailUrl" placeholder="Thumbnail URL" className="w-full rounded-xl bg-black/30 px-3 py-2"/>
<button className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Create</button>
</form>
</AdminGuard>
);
}