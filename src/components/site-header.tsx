"use client";

import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { MegaMenu } from "@/components/mega-menu";
import { User } from "@supabase/supabase-js";

export function SiteHeader({ user }: { user: User | null }) {
    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <header className="w-full max-w-7xl h-16 flex items-center justify-between px-2 pl-4 pr-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl shadow-black/5 mx-auto transition-all duration-300">
                
                {/* Logo */}
                <div className="flex items-center gap-2 mr-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        MA
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white hidden sm:block">
                        MarketingAgent
                    </span>
                </div>

                {/* Central Mega Menu */}
                <div className="hidden md:block">
                    <MegaMenu />
                </div>

                {/* Right Actions */}
                <div className="flex gap-2 items-center ml-auto">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                            >
                                Dashboard
                            </Link>
                            <div className="pl-1">
                                <UserNav user={user} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
}
