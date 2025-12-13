"use client";

import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-8 h-8 text-green-500" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Analytics & Trends
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Measure what matters. The Analytics suite provides real-time insights into campaign performance and emerging market trends.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            <div className="grid gap-6">
                
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Performance Metrics
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        Track engagement across all connected platforms in a unified dashboard.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="text-sm text-zinc-500">Impressions</div>
                            <div className="font-mono font-bold text-lg">12.5K</div>
                        </div>
                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="text-sm text-zinc-500">CTR</div>
                            <div className="font-mono font-bold text-lg text-green-500">2.4%</div>
                        </div>
                        <div className="bg-white dark:bg-black p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="text-sm text-zinc-500">Conversions</div>
                            <div className="font-mono font-bold text-lg">143</div>
                        </div>
                    </div>
                </div>

                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Competitor Analysis
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Compare your "Share of Voice" against key competitors. The agent scrapes public data to estimate competitor reach and engagement, helping you benchmark your success.
                    </p>
                </div>
            </div>
        </div>
    );
}
