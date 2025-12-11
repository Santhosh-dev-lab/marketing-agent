"use client";

import { BarChart3, Box, Calendar, Plus } from "lucide-react";

export default function DashboardPage() {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Welcome back, here's what's happening today.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-medium rounded-full shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: "Active Campaigns", value: "3", icon: Box, change: "+2 this week" },
                    { label: "Scheduled Posts", value: "12", icon: Calendar, change: "Next post in 2h" },
                    { label: "Engagement Rate", value: "4.8%", icon: BarChart3, change: "+12% vs last week" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 shadow-sm backdrop-blur-sm hover:border-purple-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 transition-colors">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Checkered Placeholder for Chart */}
            <div className="w-full h-96 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] pointer-events-none" />
                <div className="relative z-10 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:scale-110 transition-transform duration-500">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Campaign Performance</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Connect your social accounts to view real-time engagement analytics and performance metrics.</p>
                    <button className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-sm font-medium transition-colors">
                        Connect Accounts
                    </button>
                </div>
            </div>
        </>
    );
}
