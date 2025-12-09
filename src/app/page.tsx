import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/10">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          MarketingAgent
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            Your Autonomous <br /> Marketing Team
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate, schedule, and analyze campaigns with AI.
            Connect your brand, and let the agent handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)]"
            >
              Get Started
            </Link>
            <button className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-full font-medium transition-all">
              View Demo
            </button>
          </div>
        </section>

        <section id="features" className="py-24 border-t border-white/10 bg-zinc-950/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Brand Twin", desc: "AI learns your voice from past posts." },
                { title: "Auto-Campaigns", desc: "Generate weeks of content in seconds." },
                { title: "Smart Scheduling", desc: "Post when your audience is awake." },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-zinc-500 text-sm">
        &copy; 2025 MarketingAgent. Built with Next.js & Supabase.
      </footer>
    </div>
  );
}
