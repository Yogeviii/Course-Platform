// app/api/lessons/[id]/like/route.ts
import { dbConnect } from "@/lib/db";
import Lesson from "@/models/Lesson";
import LessonLike from "@/models/LessonLike";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type ParamsPromise = Promise<{ id: string }>;
type LessonStats = { _id: string; views?: number; likesCount?: number };

export async function POST(_req: Request, ctx: { params: ParamsPromise }) {
  await dbConnect();

  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve the current user's ObjectId (stable across sessions)
  let userObjectId: string | undefined = (session as any).userId;
  if (!userObjectId) {
    const email = (session.user as any)?.email as string | undefined;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email })
      .select("_id")
      .lean<{ _id: string } | null>();

    if (!user?._id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userObjectId = String(user._id);
  }

  // 🔁 Explicit toggle with properly typed result
  const existing = await LessonLike.findOne({ lesson: id, user: userObjectId })
    .select("_id")
    .lean<{ _id: string } | null>();

  if (existing?._id) {
    // Unlike
    await LessonLike.deleteOne({ _id: existing._id });
    await Lesson.updateOne({ _id: id }, { $inc: { likesCount: -1 } });

    const doc = await Lesson.findById(id)
      .select({ views: 1, likesCount: 1 })
      .lean<LessonStats | null>();

    return NextResponse.json({
      liked: false,
      likesCount: doc?.likesCount ?? 0,
      views: doc?.views ?? 0,
    });
  } else {
    // Like
    await LessonLike.create({ lesson: id, user: userObjectId });
    await Lesson.updateOne({ _id: id }, { $inc: { likesCount: 1 } });

    const doc = await Lesson.findById(id)
      .select({ views: 1, likesCount: 1 })
      .lean<LessonStats | null>();

    return NextResponse.json({
      liked: true,
      likesCount: doc?.likesCount ?? 0,
      views: doc?.views ?? 0,
    });
  }
}
