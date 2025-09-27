import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
const body = await req.json();
await dbConnect();
const exists = await User.findOne({ email: body.email });
if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 400 });
const hashed = await bcrypt.hash(body.password, 10);
const user = await User.create({ email: body.email, name: body.name, password: hashed, role: "user" });
return NextResponse.json({ ok: true, id: user.id });
}