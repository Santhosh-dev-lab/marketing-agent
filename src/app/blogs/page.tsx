"use client";

import { ArrowLeft, Search, Clock, ArrowRight, TrendingUp, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BlogsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All");

    const categories = ["All", "SEO", "Content Strategy", "Social Media", "Analytics", "Automation"];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header / Back Button */}
                <div className="mb-12 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm bg-white dark:bg-black"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Marketing Insights & Trends
                    </div>
                </div>

                {/* Featured Article */}
                <div className="group relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:shadow-2xl transition-all duration-500 cursor-pointer mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold mb-6">
                                <TrendingUp className="w-3 h-3" />
                                Featured
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                                The State of AI Marketing in 2025
                            </h1>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                Explore how autonomous agents and generative models are fundamentally rewriting the playbook for customer engagement and campaign optimization.
                            </p>
                            <button className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        {/* Placeholder for visual - using a subtle gradient box for now */}
                        <div className="order-1 md:order-2 h-64 md:h-full min-h-[300px] rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center border border-zinc-100 dark:border-white/5">
                            <span className="text-purple-300 dark:text-purple-700 font-black text-8xl opacity-20">AI</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 sticky top-4 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === cat
                                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md'
                                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        />
                    </div>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Mock Data */}
                    {[
                        { title: "10 SEO Tips for 2025", category: "SEO", time: "5 min read", date: "Dec 12, 2024" },
                        { title: "How to Automate your Social Media", category: "Social Media", time: "8 min read", date: "Dec 10, 2024" },
                        { title: "The Psychology of Content Strategy", category: "Content Strategy", time: "12 min read", date: "Dec 08, 2024" },
                        { title: "Data-Driven Campaign Management", category: "Analytics", time: "6 min read", date: "Dec 05, 2024" },
                        { title: "Building a Personal Brand on LinkedIn", category: "Social Media", time: "7 min read", date: "Dec 03, 2024" },
                        { title: "Email Marketing Mastery", category: "Automation", time: "10 min read", date: "Nov 28, 2024" },
                    ].map((post, i) => (
                        <div key={i} className="group flex flex-col bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-purple-500/5 transition-all hover:-translate-y-1 cursor-pointer">
                            <div className="h-48 bg-zinc-100 dark:bg-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4">
                                    <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-black/90 backdrop-blur-md text-[10px] font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.time}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    Read Article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <button className="px-8 py-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-sm font-bold text-zinc-900 dark:text-white">
                        Load More Articles
                    </button>
                </div>
            </div>
        </div>
    );
}
