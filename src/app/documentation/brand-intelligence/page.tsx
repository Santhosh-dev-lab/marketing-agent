"use client";

import { Shield, Users, Mic2 } from "lucide-react";

export default function BrandIntelligencePage() {
    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Brand Intelligence
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Brand Intelligence is the "brain" of your agent. It ensures that every piece of content generated aligns with your company's identity, tone, and strategic goals.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            <section className="space-y-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                    <Mic2 className="w-6 h-6 text-zinc-400" />
                    Brand Voice
                </h2>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        The Brand Voice setting dictates the <strong>personality</strong> of your agent. You can define specific adjectives or describe a persona.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-lg">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 block mb-2">Example 1: Professional</span>
                            <p className="text-xs text-zinc-500 font-mono">"Authoritative, Data-driven, Concise. Avoid slang. Focus on ROI and efficiency."</p>
                        </div>
                        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-lg">
                            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400 block mb-2">Example 2: Friendly</span>
                            <p className="text-xs text-zinc-500 font-mono">"Warm, Community-focused, use emojis 🌟. Talk like a helpful peer, not a corporation."</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                    <Users className="w-6 h-6 text-zinc-400" />
                    Target Audience
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Defining your audience helps the agent tailor references, complexity, and pain points.
                </p>
                <div className="prose dark:prose-invert">
                    <ul className="text-zinc-600 dark:text-zinc-400 space-y-2">
                        <li><strong>Demographics:</strong> Age, Location, Job Titles (e.g., "CTOs in Enterprise SaaS").</li>
                        <li><strong>Pain Points:</strong> What keeps them up at night? (e.g., "High cloud costs", "Slow deployment cycles").</li>
                        <li><strong>Goals:</strong> What do they want to achieve? (e.g., "Automate workflows", "Scale revenue").</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
