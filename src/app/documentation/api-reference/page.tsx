"use client";

import { Code, Terminal, Key } from "lucide-react";

export default function ApiReferencePage() {
    return (
        <div className="space-y-12">
            <div>
                 <div className="flex items-center gap-3 mb-4">
                    <Terminal className="w-8 h-8 text-zinc-900 dark:text-white" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        API Reference
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Build on top of the Marketing Agent platform. Our REST API allows you to programmatically trigger campaigns, fetch analytics, and manage brand settings.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            {/* Auth Section */}
            <section className="space-y-6">
                 <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
                    <Key className="w-6 h-6 text-yellow-500" />
                    Authentication
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                    All API requests must be authenticated using a Bearer Token in the header.
                </p>
                <code className="block bg-zinc-900 text-zinc-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    Authorization: Bearer sk_live_...
                </code>
            </section>

             {/* Endpoint 1 */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 font-mono font-bold px-2 py-1 rounded text-sm border border-green-500/20">POST</span>
                    <h3 className="text-xl font-mono text-zinc-900 dark:text-white">/v1/campaigns</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Create a new marketing campaign. The agent will immediately begin the planning phase.
                </p>
                
                 <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 relative group overflow-hidden">
                    <div className="absolute top-4 right-4 text-xs text-zinc-600 font-mono">cURL</div>
                    <code className="block text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto">
{`curl -X POST https://api.marketing-agent.com/v1/campaigns \\
  -H "Authorization: Bearer sk_test_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "Q1 Product Launch",
    "budget": 5000,
    "platform_ids": ["li_123", "tw_456"]
  }'`}
                    </code>
                </div>
            </section>

            {/* Endpoint 2 */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold px-2 py-1 rounded text-sm border border-blue-500/20">GET</span>
                    <h3 className="text-xl font-mono text-zinc-900 dark:text-white">/v1/analytics/overview</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Retrieve aggregated performance metrics for a specific time range.
                </p>
                 <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 relative group overflow-hidden">
                     <div className="absolute top-4 right-4 text-xs text-zinc-600 font-mono">Response</div>
                     <code className="block text-zinc-400 font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto">
{`{
  "total_impressions": 45020,
  "engagement_rate": 0.035,
  "top_performing_platform": "linkedin"
}`}
                    </code>
                </div>
            </section>
        </div>
    );
}
