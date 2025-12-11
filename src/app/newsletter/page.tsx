"use client";

import { ArrowLeft, Mail, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewsletterPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header / Back Button */}
                <div className="mb-16">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-medium mb-6">
                        <Mail className="w-3 h-3" />
                        Weekly Updates
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-zinc-900 dark:text-white">
                        Stay ahead of the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">
                            Marketing Curve
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
                        Join 10,000+ marketers getting the latest AI trends, tips, and strategies delivered straight to their inbox.
                    </p>

                    {/* Subscribe Form (Visual Only) */}
                    <div className="max-w-md mx-auto flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                        <button className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl">
                            Subscribe
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
                        No spam, unsubscribe at any time.
                    </p>
                </div>

                {/* Recent Issues Grid */}
                <div>
                    <h2 className="text-2xl font-bold mb-8 border-b border-zinc-200 dark:border-white/10 pb-4">Recent Issues</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg dark:hover:shadow-purple-500/5 cursor-pointer">
                                <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Dec {10 - i}, 2025
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    The Future of AI Agents in Marketing
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                                    Discover how autonomous agents are reshaping campaign management and content creation...
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Read Issue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
