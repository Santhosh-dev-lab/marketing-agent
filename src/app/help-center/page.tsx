"use client";

import { HelpCircle, Search, Mail, MessageCircle, FileText, ChevronRight, ChevronDown, Plus, Minus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";



interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    items: FAQItem[];
}

const faqs: FAQCategory[] = [
    {
        title: "Getting Started",
        items: [
            { question: "How to create an account", answer: "To create an account, click the 'Sign Up' button in the top right corner. You can register using your email address or connect directly with your Google or GitHub account." },
            { question: "Connecting your social profiles", answer: "Go to Settings > Integrations. Click 'Connect' next to the platform you wish to add (Twitter, LinkedIn, Instagram). Follow the OAuth prompts to authorize Marketing Agent." },
            { question: "Setting up your brand voice", answer: "Navigate to Brand Profile. Upload samples of your past content or describe your tone (e.g., 'Professional', 'Witty'). Our AI analyzes this to match your style." }
        ]
    },
    {
        title: "Billing & Subscriptions",
        items: [
            { question: "Understanding the pricing plans", answer: "We offer three tiers: Starter (for individuals), Pro (for small teams), and Enterprise. Starter is free forever. Pro includes advanced analytics and 10x more generation credits." },
            { question: "How update payment method", answer: "Go to Billing settings. You can add or remove credit cards securely via our Stripe integration. Invoices are automatically sent to your billing email." },
            { question: "Downloading invoices", answer: "All past invoices are available in the 'Billing History' section of your account settings. You can download them as PDF files." }
        ]
    },
    {
        title: "Troubleshooting",
        items: [
            { question: "Campaign generation failed", answer: "This usually happens due to a temporary API timeout. Please try generating again in a few minutes. If the issue persists, check our System Status page." },
            { question: "Social connection errors", answer: "Tokens may expire over time. If your posts aren't publishing, try disconnecting and reconnecting your social account in the Integrations tab." },
            { question: "Resetting your password", answer: "Click 'Forgot Password' on the login screen. We will send a secure link to your registered email address to set a new password." }
        ]
    }
];

export default function HelpCenterPage() {
    const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(0);
    const [openQuestionIndex, setOpenQuestionIndex] = useState<string | null>(null);
    const router = useRouter();

    const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenQuestionIndex(openQuestionIndex === key ? null : key);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white font-sans">
            {/* Header */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
                <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md text-white">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">
                                Help Center
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/documentation" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                            Documentation
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative">
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

                {/* Hero Search Section */}
                <section className="py-20 px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600">help you?</span>
                    </h1>
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full py-4 pl-12 pr-4 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg placeholder:text-zinc-400"
                        />
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 pb-24 space-y-24">

                    {/* Interactive FAQ Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-purple-500" />
                            Frequently Asked Questions
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {faqs.map((category, i) => (
                                <div key={i} className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                                    <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">{category.title}</h3>
                                    <div className="space-y-1">
                                        {category.items.map((item, j) => {
                                            const isOpen = openQuestionIndex === `${i}-${j}`;
                                            return (
                                                <div key={j} className="border-b border-zinc-200 dark:border-white/5 last:border-0">
                                                    <button
                                                        onClick={() => toggleQuestion(i, j)}
                                                        className="w-full py-3 flex items-start justify-between text-left text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                                                    >
                                                        <span className="font-medium pr-4">{item.question}</span>
                                                        <span className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                                                            <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                                        </span>
                                                    </button>
                                                    <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="pb-4 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                                                                    {item.answer}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Support Channels */}
                    <section className="bg-zinc-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 max-w-xl text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white">Still need help?</h2>
                                <p className="text-zinc-400 text-lg">
                                    Our support team is available 24/7 to assist you with any issues or questions you might have.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/25">
                                    <MessageCircle className="w-5 h-5" />
                                    Chat with Support
                                </button>
                                <button className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-3">
                                    <Mail className="w-5 h-5" />
                                    Email Us
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
