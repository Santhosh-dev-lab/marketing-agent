"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

// Dynamically import Lottie to prevent SSR hydration mismatches
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function HeroSection({ user }: { user: any }) {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch the animation from the public folder
        fetch("/marketing-funnel.json")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load animation");
                return res.json();
            })
            .then((data) => setAnimationData(data))
            .catch((error) => console.error("Error loading animation:", error));
    }, []);

    return (
        <section className="relative w-full min-h-screen flex items-center pt-32 pb-20 px-6 overflow-hidden">
            {/* 3D Floating Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl rotate-12 opacity-20 blur-xl animate-float" />
                <div className="absolute bottom-40 right-10 w-32 h-32 bg-gradient-to-bl from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl animate-float animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-start text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-sm font-medium mb-6 border border-purple-100 dark:border-purple-800">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Marketing Assistant</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
                        Transform Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                            Marketing Strategy
                        </span>
                    </h1>

                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-xl">
                        Generate comprehensive marketing campaigns, analyze brand tone, and
                        automate content creation with regular human oversight.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            href={user ? "/dashboard/onboarding" : "/login"}
                            className="inline-flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Analyze Website
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Watch Demo
                        </Link>
                    </div>

                    <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 w-full">
                        <p className="text-sm text-zinc-500 mb-4 font-medium">Trusted by modern marketing teams</p>
                        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-zinc-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Instant Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Brand Consistency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>24/7 Availability</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Animation Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative aspect-square lg:aspect-[4/3] w-full max-w-lg mx-auto lg:max-w-none"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2.5rem] opacity-30 blur-2xl animate-pulse" />
                    <div className="absolute inset-0 bg-white dark:bg-zinc-100 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center p-8 z-10">
                        {/* Doodle Background */}
                        <div className="absolute inset-0 opacity-80 mix-blend-multiply">
                            <img src="/marketing-doodle-bg.png" alt="Marketing Doodles" className="w-full h-full object-cover" />
                        </div>

                        {animationData ? (
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                className="w-full h-full relative z-10"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Loading visualization...
                            </div>
                        )}
                    </div>

                    {/* Floating Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 z-20"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Campaign Ready</div>
                            <div className="text-xs text-zinc-500">Just now</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
