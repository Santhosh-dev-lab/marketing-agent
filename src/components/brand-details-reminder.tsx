"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function BrandDetailsReminder() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasDetails, setHasDetails] = useState(true); // Assume true initially to prevent flash
    const supabase = createClient();
    const router = useRouter();

    // Check status periodically
    useEffect(() => {
        let interval: NodeJS.Timeout;

        async function checkStatus() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: brand } = await supabase.from('brands').select('audience_persona').eq('user_id', user.id).single();
                
                // If missing details
                if (brand && (!brand.audience_persona || Object.keys(brand.audience_persona).length === 0)) {
                    setHasDetails(false);
                } else {
                    setHasDetails(true);
                    setIsVisible(false); // Hide if they filled it
                }
            } catch (e) {
                console.error(e);
            }
        }

        checkStatus(); // Initial check

        // Check every 2 minutes (120000ms)
        interval = setInterval(() => {
            // Only toggle visibility if we know details are missing
            if (!hasDetails) {
                // Re-verify before showing
                checkStatus().then(() => {
                    // If still missing, show reminder
                    // Note: We use a functional state update or just trust the latest closures
                    // Ideally we should rely on the state set by checkStatus inside the interval
                    setIsVisible(true);
                });
            }
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    // Also one-time show on mount if missing (optional, user said "every 2 min", but usually first load implies one check)
    // To respect "every 2 min", we can rely on the interval, OR show it once after a short delay on load.
    // Let's show it 5 seconds after load if missing, then every 2 mins.
    useEffect(() => {
        if (!hasDetails) {
            const timer = setTimeout(() => setIsVisible(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [hasDetails]);


    if (hasDetails) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-5"
                >
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Brand Details Missing</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                                Start generating better content by telling us about your brand strategy.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/settings')}
                                className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                Fill Details <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
