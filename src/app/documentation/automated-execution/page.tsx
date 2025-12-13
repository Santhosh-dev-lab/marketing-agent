"use client";

import { Code, Settings, RefreshCw } from "lucide-react";

export default function AutomatedExecutionPage() {
    return (
        <div className="space-y-12">
             <div>
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-8 h-8 text-pink-500" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Automated Execution
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Understand how the system runs autonomously. From scheduled cron jobs to event-driven webhooks, learn how the Magic Agent operates 24/7.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Code className="w-5 h-5 text-zinc-500" />
                    How it works
                </h3>
                <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
                    <p>
                        The platform uses a Distributed Queue system to handle tasks reliably. When a campaign is launched:
                    </p>
                    <ol>
                        <li><strong>Ingestion:</strong> The request is validated and stored in the database.</li>
                        <li><strong>Scheduling:</strong> Individual posts are scheduled as background jobs.</li>
                        <li><strong>Execution:</strong> At the scheduled time, the <strong>Edge Worker</strong> wakes up.</li>
                        <li><strong>Publishing:</strong> The worker authenticates with the Social Platform API (e.g., LinkedIn) and pushes the content.</li>
                        <li><strong>Verification:</strong> The system polls for a success signal (e.g., Post ID) and marks the task as complete.</li>
                    </ol>
                </div>
            </section>

             <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                    Retry Logic
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    APIs fail. We know. That's why the Automated Execution engine includes exponential backoff.
                </p>
                <code className="block bg-zinc-950 text-green-400 p-4 rounded-lg font-mono text-sm">
                    Attempt 1: Immediate<br/>
                    Attempt 2: +30s<br/>
                    Attempt 3: +5m<br/>
                    Attempt 4: +1h (Notify Admin)
                </code>
            </section>
        </div>
    );
}
