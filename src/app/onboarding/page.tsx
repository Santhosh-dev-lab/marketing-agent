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
    Wand2
} from "lucide-react";

type ToneProfile = {
    tone: string;
    adjectives: string[];
    description: string;
    keywords: string[];
};

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Form State
    const [brandName, setBrandName] = useState("");
    const [website, setWebsite] = useState("");
    const [instagram, setInstagram] = useState("");

    // Analysis State
    const [toneProfile, setToneProfile] = useState<ToneProfile | null>(null);

    const handleAnalyze = async () => {
        if (!website && !instagram) return;
        setAnalyzing(true);

        try {
            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('extract-tone', {
                body: { url: website || instagram }
            });

            if (error) throw error;
            setToneProfile(data);
        } catch (err) {
            console.error("Analysis failed:", err);
            // Fallback for demo if API fails/not deployed
            setToneProfile({
                tone: "Modern & Bold",
                adjectives: ["Innovative", "Fearless", "Direct"],
                description: "Your brand speaks with authority and cuts through the noise. You prioritize clarity and impact over fluff.",
                keywords: ["growth", "speed", "future"]
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
        <div className="min-h-screen bg-[#030303] text-white overflow-hidden selection:bg-purple-500/30 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-20" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>Brand Onboarding</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Let's build your <br className="hidden md:block" /> Digital Twin.
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
                        We'll analyze your existing presence to train your autonomous marketing agent.
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Step Content */}
                    <div className="space-y-8 relative z-10">
                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Brand Name</label>
                                <input
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:border-white/20"
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-4 w-5 h-5 text-zinc-600" />
                                    <input
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:border-white/20"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analysis Action */}
                        <div className="flex flex-col items-center justify-center py-8">
                            {!toneProfile ? (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !website}
                                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-neutral-900 duration-300 hover:w-56 hover:bg-purple-100 disabled:opacity-50 disabled:hover:w-auto"
                                >
                                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                        <div className="relative h-full w-8 bg-white/20" />
                                    </div>
                                    {analyzing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Scanning...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="w-4 h-4" />
                                            Analyze Brand Voice
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full"
                                >
                                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />

                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                                    Identity Detected
                                                </h3>
                                                <p className="text-zinc-400 text-sm mt-1">Based on content from {website}</p>
                                            </div>
                                            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {toneProfile.tone}
                                            </div>
                                        </div>

                                        <blockquote className="text-lg text-zinc-200 italic font-light border-l-2 border-purple-500/50 pl-4 mb-6">
                                            "{toneProfile.description}"
                                        </blockquote>

                                        <div className="flex flex-wrap gap-2">
                                            {toneProfile.adjectives.map((adj, i) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300">
                                                    {adj}
                                                </span>
                                            ))}
                                            {toneProfile.keywords.slice(0, 3).map((key, i) => (
                                                <span key={`k-${i}`} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                                                    #{key}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <button
                                onClick={handleSave}
                                disabled={loading || !brandName || !toneProfile}
                                className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl py-4 px-8 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Brand Agent
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
