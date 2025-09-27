import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Lesson from "@/models/Lesson";


export async function PUT(req: Request, { params }: any) {
await dbConnect();
const { orderedIds } = await req.json(); // array of lesson _id in new order
await Promise.all(orderedIds.map((id: string, idx: number) => Lesson.findByIdAndUpdate(id, { order: idx })));
return NextResponse.json({ ok: true });
}