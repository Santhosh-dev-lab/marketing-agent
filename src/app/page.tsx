import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-purple-500 selection:text-white font-sans transition-colors duration-300">
      <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 sticky top-0 bg-white/50 dark:bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
            <span className="font-bold text-white text-lg">M</span>
          </div>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">
            MarketingAgent
          </div>
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="#features" className="hover:text-purple-600 dark:hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-purple-600 dark:hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:block px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-900 dark:text-white rounded-full transition-colors border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none"
              >
                Dashboard
              </Link>
              <UserNav user={user} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full flex-1 flex flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">

          {/* Grid Pattern */}
          <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Gradient Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              v1.0 is now live
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-zinc-900 dark:text-white leading-[0.9]">
              Your Autonomous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-500 dark:to-purple-400 animate-gradient-x bg-[length:200%_auto]">
                Marketing Team
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Generate, schedule, and analyze campaigns with AI.
              <br className="hidden md:block" />
              Connect your brand, and let the agent handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold text-lg transition-all shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.23)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {user ? "Go to Dashboard" : "Start for Free"}
              </Link>
              {!user && (
                <button className="px-8 py-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 rounded-full font-semibold text-lg transition-all shadow-sm hover:shadow-md">
                  View Demo
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Everything you need to scale.</h2>
              <p className="text-zinc-500 dark:text-zinc-400">Automate your workflow with these powerful features.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Brand Twin", desc: "AI models trained on your unique voice and style.", icon: "🎭" },
                { title: "Auto-Campaigns", desc: "Generate weeks of content in seconds from a single prompt.", icon: "⚡" },
                { title: "Smart Scheduling", desc: "Predictive posting times for maximum engagement.", icon: "📅" },
              ].map((f, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-none hover:-translate-y-1">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{f.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-white/10 py-12 bg-white dark:bg-black text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="font-bold text-white text-xs">M</span>
          </div>
          <span className="font-bold text-zinc-900 dark:text-white">MarketingAgent</span>
        </div>
        <p className="text-zinc-500 text-sm">
          &copy; 2025 MarketingAgent. Built with Next.js & Supabase.
        </p>
      </footer>
    </div>
  );
}
