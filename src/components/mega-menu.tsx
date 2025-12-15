"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BarChart2, Users, PieChart, Shield, Zap, Globe, MessageSquare, Briefcase, FileText, CheckCircle } from 'lucide-react';

// --- Types ---
type MenuItem = {
    title: string;
    href: string;
    description?: string;
    icon?: React.ElementType;
};

type MenuSection = {
    title: string;
    items: MenuItem[];
};

type FeaturedItem = {
    title: string;
    description: string;
    image?: string;
    href: string;
    bgColor: string;
};

type MegaMenuData = {
    label: string; // Trigger label (e.g. "Product")
    type: 'mega' | 'simple';
    href?: string;
    columns?: MenuSection[]; // For "By Team", "By Company Type"
    featured?: FeaturedItem[]; // For "Customer Solutions" on the right
};

// --- Data Configuration (Mimicking the reference) ---
const NAV_DATA: MegaMenuData[] = [
    {
        label: "Product",
        type: "mega",
        columns: [
            {
                title: "Core Platform",
                items: [
                    { title: "Campaign Manager", href: "/dashboard/campaigns", description: "Create & schedule multi-channel campaigns", icon: Zap },
                    { title: "Brand Intelligence", href: "/dashboard/brand", description: "Define voice, audience & strategy", icon: Shield },
                    { title: "Task Center", href: "/dashboard/tasks", description: "AI-driven marketing recommendations", icon: CheckCircle },
                ]
            },
            {
                title: "Analytics & Growth",
                items: [
                    { title: "Performance Dashboard", href: "/dashboard", description: "Real-time metrics & insights", icon: BarChart2 },
                    { title: "Market Trends", href: "/dashboard/analytics/trends", description: "Analyze competitor data", icon: PieChart },
                    { title: "Security", href: "/dashboard/security", description: "Enterprise-grade protection", icon: Shield },
                ]
            }
        ],
        featured: [
            {
                title: "AI Analysis",
                description: "Deep dive into your website's performance automatically.",
                href: "/dashboard/tasks", // Closest match to "Analysis" 
                bgColor: "bg-purple-100 dark:bg-purple-900/40"
            }
        ]
    },
    {
        label: "Solutions",
        type: "mega",
        columns: [
            {
                title: "By Use Case",
                items: [
                    { title: "Content Creation", href: "/dashboard/campaigns", description: "Generate posts at scale", icon: FileText },
                    { title: "Brand Management", href: "/dashboard/brand", description: "Maintain consistency across channels", icon: Briefcase },
                    { title: "Strategic Planning", href: "/dashboard/tasks", description: "Actionable AI roadmap", icon: Zap },
                ]
            },
            {
                title: "By Team",
                items: [
                    { title: "Marketing Agencies", href: "/solutions/agencies", description: "Manage multiple client brands", icon: Globe },
                    { title: "Founders", href: "/solutions/startups", description: "Automate your first marketing hire", icon: Users },
                    { title: "Enterprise", href: "/solutions/enterprise", description: "Scale compliance & security", icon: Shield },
                ]
            }
        ],
        featured: [
            {
                title: "Agency Case Study",
                description: "How BrandX scaled to 50 clients using MarketingAgent.",
                href: "/case-studies/brandx",
                bgColor: "bg-indigo-100 dark:bg-indigo-900/40"
            },
            {
                title: "The Solo Founder",
                description: "Replacing a $10k/mo agency with AI.",
                href: "/case-studies/founder",
                bgColor: "bg-green-100 dark:bg-green-900/40"
            }
        ]
    },
    {
        label: "Resources",
        type: "mega",
        columns: [
            {
                title: "Learn",
                items: [
                    { title: "Blog", href: "/blogs", icon: FileText },
                    { title: "Community", href: "/resources/community", icon: Users },
                    { title: "Help Center", href: "/help-center", icon: MessageSquare },
                ]
            }
        ],
        featured: [
            {
                title: "API Documentation",
                description: "Build on top of our platform.",
                href: "/docs",
                bgColor: "bg-zinc-100 dark:bg-zinc-800"
            }
        ]
    },
    { label: "Company", type: "simple", href: "/about" },
    { label: "Pricing", type: "simple", href: "#pricing" },
];

export function MegaMenu() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <nav className="flex gap-2">
            {NAV_DATA.map((item, index) => (
                <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Trigger */}
                    <Link
                        href={item.href || "#"}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors ${hoveredIndex === index
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                    >
                        {item.label}
                        {item.type === 'mega' && (
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredIndex === index ? "rotate-180" : ""}`} />
                        )}
                    </Link>

                    {/* Dropdown Animation Wrapper */}
                    <AnimatePresence>
                        {hoveredIndex === index && item.type === 'mega' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 pt-4 z-50 w-max"
                                style={{ transform: "translateX(-20%)" }} // Center slightly
                            >
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 flex gap-8 min-w-[600px] max-w-[900px]">

                                    {/* Columns Section */}
                                    {item.columns?.map((col, colIdx) => (
                                        <div key={colIdx} className="w-64 space-y-4">
                                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                                {col.title}
                                            </h3>
                                            <div className="space-y-2">
                                                {col.items.map((subItem, subIdx) => (
                                                    <Link
                                                        key={subIdx}
                                                        href={subItem.href}
                                                        className="flex items-start gap-4 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group/item"
                                                    >
                                                        {subItem.icon && (
                                                            <div className="mt-1">
                                                                <subItem.icon className="w-5 h-5 text-zinc-400 group-hover/item:text-purple-600 transition-colors" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5">
                                                                {subItem.title}
                                                            </div>
                                                            {subItem.description && (
                                                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                                                    {subItem.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Vertical Divider if Featured exists */}
                                    {item.featured && <div className="w-px bg-zinc-100 dark:bg-zinc-800 self-stretch my-2" />}

                                    {/* Featured Section (Right Side) */}
                                    {item.featured && (
                                        <div className="flex-1 space-y-4 min-w-[240px]">
                                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                                                Customer Solutions
                                            </h3>
                                            <div className="grid gap-3">
                                                {item.featured.map((feat, featIdx) => (
                                                    <Link
                                                        key={featIdx}
                                                        href={feat.href}
                                                        className={`block p-4 rounded-2xl transition-transform hover:-translate-y-1 ${feat.bgColor}`}
                                                    >
                                                        <div className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
                                                            {feat.title}
                                                        </div>
                                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                            {feat.description}
                                                        </p>
                                                        {feat.image && (
                                                            <div className="mt-4 h-24 bg-zinc-900/5 rounded-lg w-full" />
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </nav>
    );
}
