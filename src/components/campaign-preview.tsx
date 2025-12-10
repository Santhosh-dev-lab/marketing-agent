"use client";

import { motion } from "framer-motion";
import { Copy, Check, Twitter, Linkedin, Instagram, Mail } from "lucide-react";
import { useState } from "react";

type Post = {
    platform: string;
    content: string;
    image_idea?: string;
};

type Email = {
    subject: string;
    body: string;
};

type CampaignData = {
    posts: Post[];
    email: Email;
};

export default function CampaignPreview({ data }: { data: CampaignData }) {
    const [activeTab, setActiveTab] = useState("all");

    const icons: Record<string, any> = {
        Twitter: Twitter,
        LinkedIn: Linkedin,
        Instagram: Instagram,
        Email: Mail
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Email Section */}
            {data.email && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg"
                >
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Email Campaign</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Subject</span>
                            <p className="text-lg font-medium text-zinc-900 dark:text-white mt-1">{data.email.subject}</p>
                        </div>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                        <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {data.email.body}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Social Posts Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {data.posts.map((post, idx) => {
                    const Icon = icons[post.platform] || Sparkles;
                    const colorClass = post.platform === 'Twitter' ? 'text-sky-500' : post.platform === 'LinkedIn' ? 'text-blue-600' : 'text-pink-500';

                    return (
                        <motion.div
                            key={idx}
                            variants={item}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-5 h-5 ${colorClass}`} />
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{post.platform}</span>
                            </div>

                            <p className="text-sm text-zinc-600 dark:text-zinc-300 flex-grow leading-relaxed">
                                {post.content}
                            </p>

                            {post.image_idea && (
                                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 text-xs text-zinc-500 italic border border-zinc-100 dark:border-zinc-800">
                                    Create visual: {post.image_idea}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button className="text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}

import { Sparkles } from "lucide-react";
