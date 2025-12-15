"use client";

import { Sparkles, MessageSquare, Calendar, CheckCircle } from "lucide-react";

export default function CampaignManagerPage() {
    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Campaign Manager
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Create comprehensive multi-channel marketing campaigns from a single text prompt. The Campaign Manager handles strategy, content generation, and scheduling.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            <div className="space-y-12 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800 before:-z-10">
                
                {/* Step 1 */}
                <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">1</div>
                    <div className="space-y-3 pt-1">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Define Your Goal</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Navigate to the Dashboard and start a new campaign. Enter a high-level goal, such as:
                        </p>
                        <div className="bg-zinc-100 dark:bg-white/10 p-4 rounded-lg border-l-4 border-amber-500 italic text-zinc-700 dark:text-zinc-300">
                            "Promote our new Black Friday sale. Target existing customers with a 20% discount code 'SAVE20'. Emphasize limited time offer."
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold shrink-0">2</div>
                    <div className="space-y-3 pt-1">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Agent Planning</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            The Magic Agent analyzes your goal and your Brand Intelligence settings. It then proposes a <strong>Content Plan</strong>, which includes:
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-4">
                            <li className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                <span className="text-sm">Platform Mix (LinkedIn, X)</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <Calendar className="w-5 h-5 text-green-500" />
                                <span className="text-sm">Posting Schedule</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold shrink-0">3</div>
                    <div className="space-y-3 pt-1">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Review & Approve</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Review the generated posts. You can edit the copy, regenerate images, or adjust the timing. Once satisfied, click <strong>Launch</strong> to schedule everything.
                        </p>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Campaign executes automatically</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
