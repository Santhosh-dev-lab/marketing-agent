"use client";

import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Analytics</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Deep dive into your performance metrics.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="h-64 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-6 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Audience Growth</h3>
                    <div className="flex items-center justify-center h-full pb-6 text-zinc-300 dark:text-zinc-700 font-mono text-sm">
                        [Placeholder: Line Chart]
                    </div>
                </div>
                <div className="h-64 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-6 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Engagement by Platform</h3>
                    <div className="flex items-center justify-center h-full pb-6 text-zinc-300 dark:text-zinc-700 font-mono text-sm">
                        [Placeholder: Bar Chart]
                    </div>
                </div>
            </div>

            <div className="w-full h-80 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Detailed Reports</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Export granular data for your team.</p>
            </div>
        </>
    );
}
