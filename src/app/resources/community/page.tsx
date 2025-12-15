"use client";

import { Users, MessageSquare, Twitter, Github, ArrowRight, Mail, Sparkles, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white font-sans">

            {/* Header */}
            <header className="px-6 h-16 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </button>
            </header>

            <div className="pt-8 pb-12 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Join 5,000+ Marketing Agents</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tight"
                    >
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">Conversation</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
                    >
                        Connect with fellow marketers, developers, and founders. Share strategies, get help, and shape the future of AI marketing.
                    </motion.p>
                </div>
            </div>

            {/* Social Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Discord */}
                    <Card
                        icon={MessageSquare}
                        title="Discord Server"
                        description="Chat live with the community, get instant support, and share your wins."
                        link="#"
                        linkText="Join Discord"
                        color="text-indigo-500"
                        delay={0.3}
                    />

                    {/* Twitter */}
                    <Card
                        icon={Twitter}
                        title="Twitter / X"
                        description="Follow for latest updates, tips, and marketing insights from our team."
                        link="#"
                        linkText="Follow @MarketingAgent"
                        color="text-blue-400"
                        delay={0.4}
                    />

                    {/* GitHub */}
                    <Card
                        icon={Github}
                        title="Open Source"
                        description="Contribute to the codebase, report bugs, and request new features."
                        link="#"
                        linkText="Star on GitHub"
                        color="text-zinc-900 dark:text-white"
                        delay={0.5}
                    />

                    {/* Newsletter (Span 2 cols on LG) */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                            <div className="space-y-4 max-w-xl z-10">
                                <div className="flex items-center gap-3 justify-center md:justify-start text-purple-400">
                                    <Mail className="w-6 h-6" />
                                    <span className="font-bold tracking-wide uppercase text-sm">Weekly Intelligence</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white">Subscribe to the Newsletter</h3>
                                <p className="text-zinc-400 text-lg">
                                    Get the top 5 marketing trends delivered to your inbox every Monday. Curated by our AI Agent.
                                </p>
                            </div>

                            <div className="z-10">
                                <Link
                                    href="/newsletter"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/10"
                                >
                                    Subscribe Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

        </div>
    );
}

// Reusable Card Component (internal)
function Card({ icon: Icon, title, description, link, linkText, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/5"
        >
            <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                {description}
            </p>
            <Link href={link} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-purple-500 transition-colors">
                {linkText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </motion.div>
    );
}
