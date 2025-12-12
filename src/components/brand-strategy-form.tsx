"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Rocket, Sparkles, Building2, UserCircle2, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FormData {
    slogan: string;
    audience_demographics: string;
    audience_pain_points: string; // comma separated
    competitors: string; // comma separated
    brand_values: string; // comma separated
}

export function BrandStrategyForm({ brandId, onComplete }: { brandId: string, onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const { register, handleSubmit, formState: { errors,  isSubmitting } } = useForm<FormData>();
    const supabase = createClient();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            // Transform data structure
            const updatePayload = {
                audience_persona: {
                    demographics: data.audience_demographics,
                    pain_points: data.audience_pain_points.split(',').map(s => s.trim()).filter(Boolean),
                },
                competitors: data.competitors.split(',').map(s => ({ name: s.trim() })).filter(Boolean),
                brand_values: data.brand_values.split(',').map(s => s.trim()).filter(Boolean),
                voice_settings: { slogan: data.slogan } 
            };

            const { error } = await supabase
                .from('brands')
                .update(updatePayload)
                .eq('id', brandId);

            if (error) throw error;
            onComplete();
        } catch (e) {
            console.error(e);
            alert("Failed to save brand strategy. Please try again.");
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-8">
                <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out" 
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="">
                <AnimatePresence mode="wait">
                    {/* Step 1: Core Identity */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Core Identity</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400">What defines your brand briefly?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Brand Slogan / Tagline
                                    </label>
                                    <input
                                        {...register("slogan", { required: true })}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Just Do It."
                                    />
                                    {errors.slogan && <span className="text-red-500 text-xs">Required</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Core Values (Comma separated)
                                    </label>
                                    <textarea
                                        {...register("brand_values", { required: true })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Innovation, Trust, Sustainability, Speed..."
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">These guide your AI's decision making.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-all"
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Market Analysis */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <UserCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Target Audience</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400">Who are we talking to?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Demographics & Persona
                                    </label>
                                    <textarea
                                        {...register("audience_demographics", { required: true })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Small business owners aged 25-40 who struggle with social media time management..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Pain Points (Comma separated)
                                    </label>
                                    <input
                                        {...register("audience_pain_points", { required: true })}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Not enough time, low budget, technical complexity..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-2.5 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-all"
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Competitive Landscape */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Competitive Intelligence</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400">Who else is in the game?</p>
                                </div>
                            </div>

                             <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Top Competitors (Comma separated)
                                    </label>
                                    <textarea
                                        {...register("competitors", { required: true })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Competitor A, Competitor B, Industry Leader C..."
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">We'll use this to differentiate your strategy.</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-2.5 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Brand Strategy
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
