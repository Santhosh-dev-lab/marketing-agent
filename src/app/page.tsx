export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { SiteHeader } from "@/components/site-header";
import { LoadingButton } from "@/components/ui/loading-button";

export default async function Home() {
  const supabase = await createClient();
  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error: any) {
    // Suppress "Invalid Refresh Token" error which is common when session expires
    if (error?.code !== 'refresh_token_not_found') {
      console.error("Home Page Auth Check Error:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-purple-500 selection:text-white font-sans transition-colors duration-300 overflow-x-hidden">
      <SiteHeader user={user} />

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
