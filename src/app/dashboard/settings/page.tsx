"use client";

import { Settings, User, Shield, CreditCard, Bell } from "lucide-react";

export default function SettingsPage() {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your account preferences and integrations.</p>
                </div>
            </header>

            <div className="max-w-3xl">
                <div className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-zinc-900 dark:text-white">Profile Information</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Update your name, email, and avatar.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-zinc-900 dark:text-white">Security</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Password, 2FA, and login sessions.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-zinc-900 dark:text-white">Billing & Plans</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage subscriptions and invoices.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-zinc-900 dark:text-white">Notifications</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Email and push notification preferences.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
