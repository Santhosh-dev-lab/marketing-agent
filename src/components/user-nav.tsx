"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
    LogOut,
    Settings,
    User as UserIcon,
    Bell,
    BookOpen,
    HelpCircle,
    CreditCard,
    ChevronUp,
    Mail,
    Newspaper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface UserNavProps {
    user: User;
}

export function UserNav({ user }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Get display name or email
    const displayName = user.user_metadata.full_name || user.email?.split('@')[0] || "User";
    const avatarUrl = user.user_metadata.avatar_url;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-neutral-700"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md overflow-hidden ring-2 ring-white dark:ring-black">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        displayName.substring(0, 2).toUpperCase()
                    )}
                </div>
                <ChevronUp className={`w-4 h-4 text-zinc-500 dark:text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-zinc-100 dark:divide-white/5"
                    >
                        {/* User Info Header */}
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center text-zinc-500 dark:text-neutral-400 font-bold">
                                    {displayName.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{displayName}</p>
                                    <p className="text-xs text-zinc-500 dark:text-neutral-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-neutral-900 rounded-lg">
                                {['light', 'dark', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${theme === t ? 'bg-white dark:bg-neutral-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-zinc-500 dark:text-neutral-500 hover:text-zinc-900 dark:hover:text-neutral-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-0.5">
                            <MenuButton icon={UserIcon} label="Profile" />
                            <MenuButton icon={Bell} label="Notifications" />
                            <MenuButton icon={Settings} label="Settings" />
                            <MenuButton icon={Mail} label="Newsletter" href="/newsletter" />
                            <MenuButton icon={Newspaper} label="Blogs" href="/blogs" />
                            <MenuButton icon={BookOpen} label="Documentation" href="/documentation" />
                            <MenuButton icon={HelpCircle} label="Help Center" href="/help-center" />
                        </div>

                        {/* Plan Upgrade */}
                        <div className="p-3">
                            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-neutral-900/50 dark:to-neutral-900/50 rounded-xl p-3 border border-zinc-200 dark:border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">Starter Plan</span>
                                    <button className="text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-md font-bold hover:bg-zinc-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
                                        Upgrade
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-neutral-500">100 generations per month</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="p-2">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import Link from "next/link";

function MenuButton({ icon: Icon, label, href }: { icon: any, label: string, href?: string }) {
    if (href) {
        return (
            <Link href={href} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors text-left group">
                <Icon className="w-4 h-4 text-zinc-400 dark:text-neutral-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                {label}
            </Link>
        )
    }

    return (
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors text-left group">
            <Icon className="w-4 h-4 text-zinc-400 dark:text-neutral-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            {label}
        </button>
    )
}
