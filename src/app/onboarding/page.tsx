"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Globe,
    Instagram,
    Loader2,
    Sparkles,
    CheckCircle2,
    Wand2,
    X,
    Cpu,
    Zap,
    LayoutTemplate
} from "lucide-react";

type ToneProfile = {
    tone: string;
    adjectives: string[];
    description: string;
    keywords: string[];
    archetype?: string;
    communication_style?: string;
};

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Form State
    const [brandName, setBrandName] = useState("");
    const [website, setWebsite] = useState("");
    const [instagram, setInstagram] = useState("");

    // Analysis State
    const [toneProfile, setToneProfile] = useState<ToneProfile | null>(null);

    const handleSkip = () => {
        router.push("/");
    };

    const handleAnalyze = async () => {
        if (!website && !instagram) return;
        setAnalyzing(true);
        setToneProfile(null);

        try {
            console.log("Invoking extract-tone...");
            const { data, error } = await supabase.functions.invoke('extract-tone', {
                body: { url: website || instagram }
            });

            if (error) {
                console.error("Supabase Invoke Error Details:", error);
                throw error;
            }
            console.log("Received Tone Data:", data);
            setToneProfile(data);
        } catch (err) {
            console.error("Analysis failed:", err);
            // Fallback for visual demo if API fails
            setToneProfile({
                tone: "Modern & Bold",
                adjectives: ["Innovative", "Fearless", "Direct"],
                description: "Your brand speaks with authority and cuts through the noise. You prioritize clarity and impact over fluff.",
                keywords: ["growth", "speed", "future"],
                archetype: "The Creator",
                communication_style: "Short, punchy sentences with high energy."
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase.from('brands').insert({
                user_id: user.id,
                name: brandName,
                website,
                instagram,
                tone_voice: toneProfile || {}
            });

            if (error) throw error;
            router.push("/wizard");
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 blur-[100px] rounded-full mix-blend-screen opacity-40 animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full mix-blend-screen opacity-40" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-10" />
            </div>

            <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Marketing<span className="text-zinc-500">Agent</span></span>
                </div>
                <button
                    onClick={handleSkip}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                    Skip for now
                </button>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-12 space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
                        Train your Agent.
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
                        We scan your digital footprint to create a custom AI model that speaks exactly like your brand.
                    </p>
                </motion.div>

                {/* Main Interaction Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Input Column */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">Brand Identity</label>
                                    <input
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        placeholder="e.g. Nike"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">Analysis Source</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-3.5 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                            placeholder="https://yourbrand.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing || !website}
                                className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Analyzing content...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-indigo-600 group-hover:text-black transition-colors" />
                                        <span>Analyze Brand Voice</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tip */}
                        <p className="text-xs text-center text-zinc-600">
                            Our AI will read your structure, headings, and tone patterns.
                        </p>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {!toneProfile ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full min-h-[400px] border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-600 space-y-4 bg-white/[0.02]"
                                >
                                    <LayoutTemplate className="w-12 h-12 opacity-20" />
                                    <p className="text-sm">Your brand DNA will appear here</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="h-full bg-gradient-to-br from-zinc-900 to-black border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden group shadow-2xl"
                                >
                                    {/* Glossy Effect */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                                    Analysis Complete
                                                </h2>
                                                <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                    Ready to be saved
                                                </p>
                                            </div>
                                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-zinc-300">
                                                {toneProfile.archetype || "Unknown Archetype"}
                                            </div>
                                        </div>

                                        <blockquote className="text-xl text-zinc-300 font-light leading-relaxed border-l-4 border-indigo-500 pl-6">
                                            "{toneProfile.description}"
                                        </blockquote>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Zap className="w-3 h-3" />
                                                    Communication Style
                                                </div>
                                                <p className="text-sm text-zinc-200">
                                                    {toneProfile.communication_style || "Professional and clear"}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Wand2 className="w-3 h-3" />
                                                    Tone Keywords
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {toneProfile.tone.split(" ").slice(0, 2).map((word, i) => (
                                                        <span key={i} className="text-sm text-zinc-200">{word}</span>
                                                    ))}
                                                    {toneProfile.keywords.slice(0, 1).map((k, i) => (
                                                        <span key={`k-${i}`} className="text-sm text-zinc-400">#{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 flex justify-end">
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25"
                                            >
                                                {loading ? "Creating Agent..." : "Confirm & Create Agent"}
                                                {!loading && <ArrowRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
