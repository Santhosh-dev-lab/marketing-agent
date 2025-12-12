"use client";

import { BarChart3, Box, Calendar, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandStrategyForm } from "@/components/brand-strategy-form";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [brandId, setBrandId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function checkBrandStrategy() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: brand } = await supabase.from('brands').select('id, audience_persona').eq('user_id', user.id).single();
                
                if (brand) {
                    setBrandId(brand.id);
                    // Open modal if strategy is missing
                    if (!brand.audience_persona || Object.keys(brand.audience_persona).length === 0) {
                        // Check if user previously skipped (optional: store in local storage)
                        const skipped = localStorage.getItem(`skip_onboarding_${brand.id}`);
                        if (!skipped) {
                            setShowOnboarding(true);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        checkBrandStrategy();
    }, []);

    const handleSkip = () => {
        setShowOnboarding(false);
        if (brandId) {
            localStorage.setItem(`skip_onboarding_${brandId}`, "true");
        }
    };

    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Welcome back, here's what's happening today.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-medium rounded-full shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </header>

            {/* Analytics Dashboard */}
            <DashboardAnalytics />

            {/* Onboarding Modal */}
            <AnimatePresence>
                {showOnboarding && brandId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
                        >
                            {/* Modal Header with Skip */}
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-black/20">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Complete Your Brand Strategy</h2>
                                    <p className="text-sm text-zinc-500">Provide details to help our AI generate better content.</p>
                                </div>
                                <button
                                    onClick={handleSkip}
                                    className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>

                            {/* Scrollable Form Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900">
                                {/* Pass a wrapper to BrandStrategyForm to handle completion gracefully */}
                                <BrandStrategyForm 
                                    brandId={brandId} 
                                    onComplete={() => {
                                        setShowOnboarding(false);
                                        // Maybe show a confetti or toast here
                                    }} 
                                    // We might need to adjust BrandStrategyForm styling to fit modal better if it has its own container
                                />
                            </div>
                           
                            {/* Footer Notice */}
                            <div className="p-4 bg-zinc-50 dark:bg-black/20 border-t border-zinc-100 dark:border-zinc-800 text-center">
                                <p className="text-xs text-zinc-500">
                                    You can always update these details later in <span className="font-semibold text-zinc-700 dark:text-zinc-300">Settings</span>.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
