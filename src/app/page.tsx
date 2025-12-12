export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";

import { LoadingButton } from "@/components/ui/loading-button";

export default async function Home() {
  const supabase = await createClient();
  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // Suppress "Invalid Refresh Token" error
    console.error("Home Page Auth Check Error:", error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-purple-500 selection:text-white font-sans transition-colors duration-300 overflow-x-hidden">
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="w-full max-w-7xl h-16 flex items-center justify-between px-2 pl-4 pr-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl shadow-black/5 mx-auto transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              MA
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white hidden sm:block">
              MarketingAgent
            </span>
          </div>

          <nav className="hidden md:flex gap-1 bg-zinc-100/50 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-5 py-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Dashboard
                </Link>
                <div className="pl-1">
                  <UserNav user={user} />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main className="flex-1 flex flex-col">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-white dark:bg-black" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,black_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_20%,black_100%)] opacity-50" />

          {/* Subtle animated blobs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000" />
        </div>

        <HeroSection user={user} />

        {/* Onboarding Logic Removed: Replaced with Dashboard Reminder Card */}

        <FeaturesSection />
      </main>

      <footer className="relative z-10 border-t border-zinc-200 dark:border-white/10 py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
              <span className="font-bold text-white dark:text-black">M</span>
            </div>
            <span className="font-bold text-xl text-zinc-900 dark:text-white">MarketingAgent</span>
          </div>

          <div className="flex gap-8 mb-8 text-sm font-medium text-zinc-500">
            <Link href="#" className="hover:text-purple-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-purple-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-purple-600 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-purple-600 transition-colors">GitHub</Link>
          </div>

          <p className="text-zinc-400 text-sm font-light">
            &copy; 2025 MarketingAgent Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div >

  );
}
