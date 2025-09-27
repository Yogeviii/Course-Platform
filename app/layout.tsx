import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import type { ReactNode } from "react";

export const metadata = { title: "Course Platform" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* Remove gradient here; make body the canvas host */}
      <body className="relative min-h-screen text-white antialiased">
        {/* Global background lives OUTSIDE any container, edge-to-edge */}
        <div className="fixed inset-0 -z-10">
          <div className="bg-surface" />
          <div className="bg-vignette" />
          <div className="bg-noise" />
        </div>

        <Providers>
          <Navbar />
          {/* Full-width main, with an inner container for page content */}
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
