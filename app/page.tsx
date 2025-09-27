import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/browse");

  return (
    <div className="relative">
      <section className="px-0 py-24 text-center">
        <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <h1 className="text-5xl/tight font-extrabold tracking-tight md:text-6xl">
          Learn new skills with creators you trust.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
          A curated library of high-quality courses. Clean design. Seamless watching.
          Learn at your pace—anywhere.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/browse" className="btn-primary">Browse courses</Link>
          <Link href="/register" className="btn-ghost">Create account</Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 items-center justify-items-center gap-6 text-white/65 sm:grid-cols-4">
          <li className="text-sm">Curated by experts</li>
          <li className="text-sm">Distraction-free viewing</li>
          <li className="text-sm">Private & secure</li>
          <li className="text-sm">Works on any device</li>
        </ul>
      </section>

      <section className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold">Beautiful browsing</h3>
          <p className="mt-2 text-white/70">
            Rich thumbnails and smooth micro-interactions make discovering your next lesson effortless.
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold">Seamless watching</h3>
          <p className="mt-2 text-white/70">
            A clean player and structured lessons keep focus where it belongs—on learning.
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold">Stay on track</h3>
          <p className="mt-2 text-white/70">
            Clear progress and easy navigation help you pick up exactly where you left off.
          </p>
        </div>
      </section>
    </div>
  );
}
