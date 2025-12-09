"use client";

import { BookOpen, Sparkles, Zap, Shield, Code, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DocumentationPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setIsMobileMenuOpen(false);
        }
    };

    const SidebarLink = ({ id, children, active = false }: { id: string, children: React.ReactNode, active?: boolean }) => (
        <button
            onClick={() => scrollToSection(id)}
            className={`block w-full text-left pl-4 border-l-2 ${active ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'} transition-all`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white font-sans">
            {/* Header */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
                <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md text-white">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600 hidden sm:block">
                            Documentation
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                API Reference
                            </Link>
                        </div>
                        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12 relative">

                {/* Grid Pattern Background */}
                <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10 fixed" />

                {/* Sidebar Navigation */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-black transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block md:w-64 md:bg-transparent ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} pt-20 md:pt-0 px-6 md:px-0`}>
                    <nav className="space-y-8 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-10 scrollbar-hide">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wider">Getting Started</h3>
                            <div className="space-y-2 ml-1">
                                <SidebarLink id="intro" active>Introduction</SidebarLink>
                                <SidebarLink id="quick-start">Quick Start</SidebarLink>
                                <SidebarLink id="core-concepts">Core Concepts</SidebarLink>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wider">Guides</h3>
                            <div className="space-y-2 ml-1">
                                <SidebarLink id="campaign-management">Campaign Management</SidebarLink>
                                <SidebarLink id="analytics">Analytics & Reports</SidebarLink>
                                <SidebarLink id="team">Team Collaboration</SidebarLink>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wider">Developers</h3>
                            <div className="space-y-2 ml-1">
                                <SidebarLink id="api-ref">API Reference</SidebarLink>
                                <SidebarLink id="webhooks">Webhooks</SidebarLink>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 max-w-3xl min-w-0">
                    <div className="space-y-16">

                        {/* Introduction Section */}
                        <section id="intro" className="space-y-6 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">
                                    Marketing Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Docs</span>
                                </h1>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed md:text-xl">
                                    Welcome to the comprehensive guide for Marketing Agent. This autonomous system helps you generate, schedule, and analyze marketing campaigns with the power of advanced AI models.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div onClick={() => scrollToSection('quick-start')} className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer group">
                                    <Sparkles className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Quick Start Guide</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Get your first campaign running in less than 5 minutes.</p>
                                </div>
                                <div onClick={() => scrollToSection('core-concepts')} className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer group">
                                    <Zap className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-500 transition-colors">Features Overview</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Explore agents, workflows, and analytics.</p>
                                </div>
                            </div>
                        </section>

                        <hr className="border-zinc-200 dark:border-white/10" />

                        {/* Quick Start */}
                        <section id="quick-start" className="space-y-6 scroll-mt-24">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm">1</span>
                                Quick Start
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Follow these simple steps to launch your first AI-driven marketing campaign.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-6">
                                    <h3 className="font-semibold text-lg mb-2">1. Connect Your Brand</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                        Navigate to Settings &gt; Brand Profile. Upload your logo, define your color palette, and describe your brand voice (e.g., "Professional yet witty").
                                    </p>
                                </div>
                                <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-6">
                                    <h3 className="font-semibold text-lg mb-2">2. Create a Campaign</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                        Go to the Dashboard and click "+ New Campaign". Enter a prompt like "Launch week for our new coffee blend". The agent will suggest a multi-channel strategy.
                                    </p>
                                </div>
                                <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-6">
                                    <h3 className="font-semibold text-lg mb-2">3. Review and Approve</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                        The Copywriter Agent will generate posts for X, LinkedIn, and Instagram. Review the drafts, make edits if needed, and click "Schedule All".
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Core Concepts */}
                        <section id="core-concepts" className="space-y-6 scroll-mt-24">
                            <h2 className="text-3xl font-bold">Core Concepts</h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Agents & Workflows</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                        Marketing Agent operations are built around intelligent agents. Each agent specializes in a specific domain and works in a chain.
                                    </p>
                                    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 overflow-x-auto shadow-inner">
                                        <code className="text-sm font-mono text-purple-300">
                                            Agent ("Strategist") &rarr; Agent ("Copywriter") &rarr; Agent ("Designer") &rarr; Review
                                        </code>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-500" />
                                        Brand Safety Layer
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        Every piece of content generated passes through a deterministic brand safety layer. This checks for prohibited keywords, tone consistency, and competitive mentions before you ever see it.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <hr className="border-zinc-200 dark:border-white/10" />

                        {/* Guides Section */}
                        <section id="campaign-management" className="space-y-6 scroll-mt-24">
                            <h2 className="text-3xl font-bold">Campaign Management</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Campaigns are the containers for your marketing activities. They can encompass multiple channels (Social, Email, Ads) and span different timelines.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
                                <li><strong>Single-shot posts:</strong> Best for quick announcements.</li>
                                <li><strong>Drip campaigns:</strong> Scheduled sequences for product launches.</li>
                                <li><strong>Evergreen recycling:</strong> Automatically re-post high-performing timeless content.</li>
                            </ul>
                        </section>

                        <section id="analytics" className="space-y-6 scroll-mt-24">
                            <h2 className="text-3xl font-bold">Analytics & Reports</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                The dashboard provides real-time insights into your performance across all connected channels.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/10 text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Engagement</div>
                                    <div className="text-xs text-zinc-500">Likes, Comments, Shares</div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/10 text-center">
                                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">Reach</div>
                                    <div className="text-xs text-zinc-500">Impressions & Views</div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-white/10 text-center">
                                    <div className="text-2xl font-bold text-amber-500">Conversion</div>
                                    <div className="text-xs text-zinc-500">Click-through Rate</div>
                                </div>
                            </div>
                        </section>

                        <section id="team" className="space-y-6 scroll-mt-24">
                            <h2 className="text-3xl font-bold">Team Collaboration</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Invite team members to review content before it goes live. You can assign roles such as "Admin", "Editor", or "Viewer".
                            </p>
                        </section>

                        <hr className="border-zinc-200 dark:border-white/10" />

                        {/* API Reference */}
                        <section id="api-ref" className="space-y-6 scroll-mt-24">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-zinc-900 dark:bg-white/5 p-8 rounded-3xl border border-zinc-800 dark:border-white/10 text-white">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Code className="w-6 h-6 text-blue-400" />
                                        Developer API
                                    </h2>
                                    <p className="text-zinc-400 max-w-sm">
                                        Programmatically create campaigns and retrieve analytics using our REST API.
                                    </p>
                                </div>
                                <button className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg">
                                    Read API Docs <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Authentication</h3>
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    All API requests must include your API key in the header:
                                </p>
                                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                                    <code className="text-green-400 font-mono text-sm">Authorization: Bearer ma_sk_live_...</code>
                                </div>
                            </div>
                        </section>

                        <section id="webhooks" className="space-y-6 scroll-mt-24 pb-24">
                            <h2 className="text-2xl font-bold">Webhooks</h2>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Subscribe to events like <code className="bg-zinc-100 dark:bg-white/10 px-1 py-0.5 rounded text-sm">campaign.completed</code> or <code className="bg-zinc-100 dark:bg-white/10 px-1 py-0.5 rounded text-sm">post.failed</code> to trigger actions in your own systems.
                            </p>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}
