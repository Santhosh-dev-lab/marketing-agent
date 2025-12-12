"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandStrategyForm } from "@/components/brand-strategy-form";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";

export function OnboardingModal({ user }: { user: User | null }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        async function checkBrandStrategy() {
            try {
                const { data: brand } = await supabase.from('brands').select('id, audience_persona').eq('user_id', user.id).single();
                
                if (brand) {
                    setBrandId(brand.id);
                    // Open modal if strategy is missing
                    if (!brand.audience_persona || Object.keys(brand.audience_persona).length === 0) {
                        setShowOnboarding(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        checkBrandStrategy();
    }, [user]);

    const handleSkip = () => {
        setShowOnboarding(false);
        // Removed permanent skip storage intentionally
    };

    return (
        <AnimatePresence>
            {showOnboarding && brandId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
                            <BrandStrategyForm 
                                brandId={brandId} 
                                onComplete={() => setShowOnboarding(false)} 
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
    );
}
