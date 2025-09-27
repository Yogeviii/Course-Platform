import { dbConnect } from "@/lib/db";
import Lesson from "@/models/Lesson";
import LessonLike from "@/models/LessonLike";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type ParamsPromise = Promise<{ id: string }>;
type LessonStats = { _id: string; views?: number; likesCount?: number };

export async function GET(_req: Request, ctx: { params: ParamsPromise }) {
  await dbConnect();

  const { id } = await ctx.params; // ✅

  const lesson = await Lesson.findById(id)
    .select({ views: 1, likesCount: 1 })
    .lean<LessonStats | null>();
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  let liked = false;

  if (session) {
    let userObjectId: string | undefined = (session as any).userId;

    // Fallback to resolving by email if you don't store userId on session
    if (!userObjectId) {
      const email = (session.user as any)?.email as string | undefined;
      if (email) {
        const user = await User.findOne({ email })
          .select("_id")
          .lean<{ _id: string } | null>();
        if (user?._id) userObjectId = String(user._id);
      }
    }

    if (userObjectId) {
      const like = await LessonLike.findOne({ lesson: id, user: userObjectId })
        .select("_id")
        .lean<{ _id: string } | null>();
      liked = !!like;
    }
  }

  return NextResponse.json({
    views: lesson.views ?? 0,
    likesCount: lesson.likesCount ?? 0,
    liked,
  });
}
