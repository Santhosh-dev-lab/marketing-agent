"use client";

import { motion } from "framer-motion";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function DocumentationOverview() {
    return (
        <div className="space-y-12">
            
            {/* Intro Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-mono uppercase tracking-wider border border-purple-500/20">
                        v2.0.0
                    </span>
                    <span className="text-zinc-400 text-sm">Last updated: Dec 13, 2025</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">
                    Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Overview</span>
                </h1>
                
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed md:text-xl max-w-2xl">
                    Marketing Agent is an autonomous system designed to scale your brand's voice. It combines 
                    <strong> Brand Intelligence</strong> with <strong>Agentic Workflows</strong> to plan, execute, and analyze multi-channel campaigns.
                </p>
            </motion.div>

            <hr className="border-zinc-200 dark:border-white/10" />

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/documentation/brand-intelligence" className="group p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                    <Shield className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Setup Brand Profile</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Define your voice, audience, and core values.</p>
                </Link>
                <Link href="/documentation/campaign-manager" className="group p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/5">
                    <Zap className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg mb-2 group-hover:text-amber-500 transition-colors">Start a Campaign</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Generate content plans from a single prompt.</p>
                </Link>
            </div>

            {/* System Architecture */}
            <section className="space-y-6">
                 <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    System Architecture
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                    A high-level view of how the Magic Agent orchestrates tasks between the Edge API, LLM Reasoning Engine, and external Social Networks.
                </p>

                {/* Architecture Diagram */}
                <div className="mt-8">
                     <ArchitectureDiagram />
                </div>
            </section>

        </div>
    );
}
