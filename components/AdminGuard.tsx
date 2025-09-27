"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";


export default function AdminGuard({ children }: { children: React.ReactNode }) {
const { data: session, status } = useSession();
if (status === "loading") return null;
const role = (session?.user as any)?.role;
if (role !== "admin") redirect("/");
return <>{children}</>;
}