import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";


export async function GET(_: Request, { params }: any) {
await dbConnect();
const c = await Course.findById(params.id).populate("lessons").lean();
return NextResponse.json(c);
}


export async function PUT(req: Request, { params }: any) {
await dbConnect();
const body = await req.json();
const c = await Course.findByIdAndUpdate(params.id, body, { new: true });
return NextResponse.json(c);
}


export async function DELETE(_: Request, { params }: any) {
await dbConnect();
await Course.findByIdAndDelete(params.id);
return NextResponse.json({ ok: true });
}