"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
const r = useRouter();
const [form, setForm] = useState({ name: "", email: "", password: "" });
async function submit() {
await fetch("/api/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
r.push("/login");
}
return (
<div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
<h1 className="mb-4 text-xl font-bold">Register</h1>
<input placeholder="Name" className="mb-2 w-full rounded-xl bg-black/30 px-3 py-2" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value})} />
<input placeholder="Email" className="mb-2 w-full rounded-xl bg-black/30 px-3 py-2" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value})} />
<input type="password" placeholder="Password" className="mb-4 w-full rounded-xl bg-black/30 px-3 py-2" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value})} />
<button onClick={submit} className="w-full rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Create account</button>
<p className="mt-3 text-sm text-white/60">Have an account? <a href="/login" className="underline">Login</a></p>
</div>
);
}