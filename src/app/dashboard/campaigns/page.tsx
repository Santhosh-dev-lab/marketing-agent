"use client";

import { Box, Plus } from "lucide-react";

export default function CampaignsPage() {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Campaigns</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your active and scheduled marketing campaigns.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 text-sm font-medium rounded-full shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </header>

            <div className="w-full h-96 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm border-dashed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Box className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No active campaigns</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
                    You haven't created any campaigns yet. Start by creating a new campaign to reach your audience.
                </p>
                <button className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 text-sm font-medium transition-colors">
                    Create your first campaign
                </button>
            </div>
        </>
    );
}
