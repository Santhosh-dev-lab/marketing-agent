"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Zap, BarChart3, Fingerprint } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Brand Twin Identity",
        desc: "Our AI analyzes your website and learns your unique tone of voice perfectly.",
        icon: <Fingerprint className="w-6 h-6" />,
        color: "from-pink-500/20 to-rose-500/20",
        border: "group-hover:border-pink-500/50",
        text: "text-pink-500",
    },
    {
        title: "Autonomous Campaigns",
        desc: "Generate weeks of high-converting social content from a single prompt.",
        icon: <Zap className="w-6 h-6" />,
        color: "from-yellow-500/20 to-amber-500/20",
        border: "group-hover:border-yellow-500/50",
        text: "text-yellow-500",
    },
    {
        title: "Predictive Analytics",
        desc: "Know exactly what to post and when for maximum engagement.",
        icon: <BarChart3 className="w-6 h-6" />,
        color: "from-blue-500/20 to-cyan-500/20",
        border: "group-hover:border-blue-500/50",
        text: "text-blue-500",
    },
];

export function FeaturesSection() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section id="features" className="relative z-10 w-full py-24 border-t border-zinc-200 dark:border-white/5">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight">
                            Supercharge your growth.
                        </h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light">
                            Our AI agents work around the clock to analyze trends, create content,
                            and optimize your campaigns.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 h-auto md:h-96">
                    {features.map((f, i) => {
                        const isHovered = hoveredIndex === i;
                        const isAnyHovered = hoveredIndex !== null;

                        return (
                            <motion.div
                                key={i}
                                onHoverStart={() => setHoveredIndex(i)}
                                onHoverEnd={() => setHoveredIndex(null)}
                                className={cn(
                                    "relative flex flex-col justify-end p-6 rounded-3xl overflow-hidden transition-all duration-500 ease-in-out cursor-pointer border border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-zinc-900",
                                    "md:flex-[1] hover:md:flex-[2]", // Flex grow logic
                                    f.border
                                )}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                {/* Gradient Background on Hover */}
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                                        f.color,
                                        isHovered ? "opacity-100" : ""
                                    )}
                                />

                                {/* Icon */}
                                <div className="relative z-10 mb-auto">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg transition-transform duration-300",
                                            f.text,
                                            isHovered ? "scale-110 rotate-3" : ""
                                        )}
                                    >
                                        {f.icon}
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="relative z-10 mt-8">
                                    <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white leading-tight">
                                        {f.title}
                                    </h3>
                                    <motion.p
                                        className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xs"
                                        animate={{
                                            opacity: 1 // Always visible for simplicity in this layout, or toggle based on expansion
                                        }}
                                    >
                                        {f.desc}
                                    </motion.p>
                                </div>

                                {/* Decorative Pattern */}
                                <div className="absolute top-4 right-4 text-zinc-900/5 dark:text-white/5 transform rotate-12 scale-150 pointer-events-none">
                                    {f.icon}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
