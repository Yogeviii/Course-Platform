import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";


export async function GET() {
await dbConnect();
const x = await Course.find({ published: true }).lean();
return NextResponse.json(x);
}


export async function POST(req: Request) {
await dbConnect();
const body = await req.json();
const c = await Course.create(body);
return NextResponse.json(c, { status: 201 });
}