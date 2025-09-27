"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";


export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
return (
<div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
<h1 className="mb-4 text-xl font-bold">Login</h1>
<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full rounded-xl bg-black/30 px-3 py-2"/>
<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="mb-4 w-full rounded-xl bg-black/30 px-3 py-2"/>
<button onClick={()=>signIn("credentials", { email, password, callbackUrl: "/browse" })} className="w-full rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">Sign in</button>
<p className="mt-3 text-sm text-white/60">No account? <a href="/register" className="underline">Register</a></p>
</div>
);
}