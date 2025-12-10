"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2, Calendar as CalIcon, ChevronRight } from "lucide-react";
import CampaignPreview from "@/components/campaign-preview";

export default function WizardPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [brand, setBrand] = useState<any>(null);

    // Form
    const [goal, setGoal] = useState("");
    const [dateRange, setDateRange] = useState("Next Week"); // Simple select for MVP

    // Result
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        // Fetch User's Brand
        const fetchBrand = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase.from('brands').select('*').eq('user_id', user.id).single();
            setBrand(data);
            setLoading(false);
        };
        fetchBrand();
    }, []);

    const handleGenerate = async () => {
        if (!brand || !goal) return;
        setGenerating(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('generate-campaign', {
                body: {
                    brand_id: brand.id,
                    goal,
                    date_range: dateRange
                }
            });

            if (error) throw error;
            console.log("Generation Result:", data);
            setResult(data);
        } catch (e) {
            console.error(e);
            alert("Failed to generate campaign. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-20">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,transparent)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Campaign Wizard</h1>
                        <p className="text-zinc-500 mt-1">
                            Creating content for <span className="text-white font-medium">{brand?.name || "Your Brand"}</span>
                        </p>
                    </div>
                </div>

                {/* Input Section (Hidden when result is shown? Or Stick to top?) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Main Input */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-zinc-400">What is your goal for this campaign?</label>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                placeholder="e.g. Announce our Summer Sale with 50% off all shoes. Tone should be exciting and urgent."
                            />
                        </div>
                    </div>

                    {/* Sidebar / Controls */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400">Timing</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option>Immediate</option>
                                <option>Next Week</option>
                                <option>Next Month</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !goal}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Dreaming up ideas...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate Campaign
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-grow bg-white/10" />
                                <span className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Generated Output</span>
                                <div className="h-px flex-grow bg-white/10" />
                            </div>

                            <CampaignPreview data={result} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
