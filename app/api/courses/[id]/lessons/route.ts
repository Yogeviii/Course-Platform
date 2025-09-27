import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Lesson from "@/models/Lesson";


export async function POST(req: Request, { params }: any) {
await dbConnect();
const body = await req.json();
const count = await Lesson.countDocuments({ course: params.id });
const l = await Lesson.create({ ...body, course: params.id, order: count });
return NextResponse.json(l, { status: 201 });
}