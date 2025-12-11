"use client";

import { BarChart3, Box, LayoutDashboard, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [credits, setCredits] = useState({ used: 0, left: 12 });
    const supabase = createClient();

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        async function fetchCredits() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single();
                if (!brand) return;

                const { data: creditRows } = await supabase.from('user_credits').select('credits_remaining').eq('brand_id', brand.id);

                const initiatedAgentsCount = creditRows?.length || 0;
                // Assuming 4 agent types: strategy, content, visual, brand_twin
                const totalAgents = 4;
                const defaultCredits = 3;
                const totalPossible = totalAgents * defaultCredits; // 12

                const sumRemaining = creditRows?.reduce((a, b) => a + b.credits_remaining, 0) || 0;
                const uninitiatedCredits = (totalAgents - initiatedAgentsCount) * defaultCredits;

                const totalLeft = sumRemaining + uninitiatedCredits;
                const totalUsed = totalPossible - totalLeft;

                setCredits({ used: totalUsed, left: totalLeft });
            } catch (e) {
                console.error("Error fetching credits:", e);
            }
        }
        fetchCredits();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="relative z-10 flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 border-r border-zinc-200 dark:border-white/10 p-6 flex flex-col gap-6 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 h-screen">

                    <div className="flex items-center gap-2 px-2 pb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md text-white font-bold">
                            M
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">
                            MarketingAgent
                        </span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard')
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Overview
                        </Link>
                        <Link
                            href="/dashboard/campaigns"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/campaigns')
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <Box className="w-5 h-5" />
                            Campaigns
                        </Link>
                        <Link
                            href="/dashboard/analytics"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/analytics')
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            Analytics
                        </Link>
                        <Link
                            href="/dashboard/brand"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/brand')
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-current rounded">B</span>
                            Brand Twin
                        </Link>
                        <Link
                            href="/dashboard/settings"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard/settings')
                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </Link>
                    </nav>

                    <div className="mt-auto flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-500/20">
                            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">Pro Plan</h4>
                            <div className="flex justify-between items-center text-xs mb-3">
                                <span className="text-purple-600 dark:text-purple-400">Used: <span className="font-semibold">{credits.used}</span></span>
                                <span className="text-purple-800 dark:text-purple-200">Left: <span className="font-semibold">{credits.left}</span></span>
                            </div>
                            <div className="w-full h-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(credits.used / 12) * 100}%` }}
                                />
                            </div>
                            <button className="w-full py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity">
                                Upgrade Now
                            </button>
                        </div>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all text-sm font-medium w-full justify-center"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
