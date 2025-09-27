"use client";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <Link href="/" className="font-bold tracking-wider">one•creator</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/browse">Browse</Link>
          {role === "admin" && <Link href="/admin" className="font-semibold">Admin</Link>}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" /* redirect: true (default) */ })}
              className="rounded-xl bg-white/10 px-3 py-1 hover:bg-white/20"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/browse" })}
              className="rounded-xl bg-white/10 px-3 py-1 hover:bg-white/20"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
