import { dbConnect } from "@/lib/db";
import Lesson from "@/models/Lesson";
import { NextResponse } from "next/server";

type ParamsPromise = Promise<{ id: string }>;
type LessonStats = { _id: string; views?: number; likesCount?: number };

export async function POST(_req: Request, ctx: { params: ParamsPromise }) {
  await dbConnect();

  const { id } = await ctx.params; // ✅ Next 15: await
  await Lesson.updateOne({ _id: id }, { $inc: { views: 1 } });

  const doc = await Lesson.findById(id)
    .select({ views: 1, likesCount: 1 })
    .lean<LessonStats | null>();

  return NextResponse.json({
    views: doc?.views ?? 0,
    likesCount: doc?.likesCount ?? 0,
  });
}
