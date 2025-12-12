"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandSettingsEditor } from "@/components/brand-settings-editor";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { X } from "lucide-react";

export function OnboardingModal({ user }: { user: User | null }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [brandId, setBrandId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        async function checkBrandStrategy() {
            try {
                if (!user) return;
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

    const handleClose = () => {
        setShowOnboarding(false);
    };

    return (
        <AnimatePresence>
            {showOnboarding && brandId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col relative border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Brand Strategy Setup</h2>
                                <p className="text-sm text-zinc-500">Configure your autonomous marketing agent.</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-0 bg-zinc-50 dark:bg-black/20">
                            <div className="p-6">
                                <BrandSettingsEditor brandId={brandId} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
