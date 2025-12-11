"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Globe, RefreshCw, Zap, Brain, Sparkles, Layout } from "lucide-react";

export default function BrandTwinPage() {
    const [brand, setBrand] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState("");
    const [isTraining, setIsTraining] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const supabase = createClient();

    useEffect(() => {
        fetchBrand();
    }, []);

    // Helper to get or create brand safely (Read-First Pattern with Self-Healing)
    const getOrCreateBrand = async (userId: string) => {
        try {
            // 1. Try to find EXISTING brand first (Read-only, quiet)
            const { data: existing } = await supabase
                .from('brands')
                .select('*')
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle();

            if (existing) return existing;

            // 2. Only if not found, try to Create (Upsert for safety)
            const { data: newBrand, error } = await supabase
                .from('brands')
                .upsert(
                    { name: 'My Launchpad Brand', user_id: userId },
                    { onConflict: 'user_id', ignoreDuplicates: false }
                )
                .select('*')
                .single();

            if (newBrand) return newBrand;

            if (error) {
                // Handle FK Violation (23503): Missing Profile
                if (error.code === '23503') {
                    console.warn("Profile missing. Auto-healing...");
                    // 3. Create missing Profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({ id: userId });

                    if (!profileError) {
                        // 4. Retry Brand Creation
                        const { data: retryBrand } = await supabase
                            .from('brands')
                            .upsert(
                                { name: 'My Launchpad Brand', user_id: userId },
                                { onConflict: 'user_id', ignoreDuplicates: false }
                            )
                            .select('*')
                            .single();
                        if (retryBrand) return retryBrand;
                    } else {
                        console.error("Failed to auto-heal profile:", profileError);
                    }
                }

                // Final attempted fetch if upsert erroneously failed
                const { data: final } = await supabase
                    .from('brands')
                    .select('*')
                    .eq('user_id', userId)
                    .limit(1)
                    .maybeSingle();
                if (final) return final;

                console.error("Brand creation error:", error);
            }
            return null;

        } catch (e) {
            console.error("Brand Logic Error", e);
            return null;
        }
    };

    const fetchBrand = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = await getOrCreateBrand(user.id);

        setBrand(data);
        setUrl(data?.website || "");
        setLoading(false);
    };

    const runTraining = async () => {
        if (!brand || !url) return;
        setIsTraining(true);
        // Clear previous logs to show fresh activity
        setLogs(["Starting training..."]);

        try {
            // 1. Ingest Knowledge
            setLogs(prev => ["Scraping website & generating memories...", ...prev]);
            const ingestRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/brand-twin-ingest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, brand_id: brand.id })
            });
            const ingestData = await ingestRes.json();
            if (!ingestRes.ok) throw new Error(ingestData.error || "Ingestion Failed");
            setLogs(prev => [`Ingested ${ingestData.chunks_ingested || 0} chunks of knowledge.`, ...prev]);

            // 2. Analyze Voice
            setLogs(prev => ["Analyzing Brand Voice & Archetype...", ...prev]);
            const toneRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract-tone`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, brand_id: brand.id })
            });

            const toneData = await toneRes.json();
            if (!toneRes.ok) throw new Error(toneData.error || "Tone Analysis Failed");

            setLogs(prev => [`Voice Analyzed: ${toneData.archetype} - ${toneData.tone}`, ...prev]);
            setLogs(prev => ["Training Complete!", ...prev]);

            // Refresh Data
            fetchBrand();

        } catch (e: any) {
            setLogs(prev => [`Error: ${e.message}`, ...prev]);
        } finally {
            setIsTraining(false);
        }
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading Brand Twin...</div>;

    const voice = brand?.tone_voice || {};

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-600" />
                    Brand Twin
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Train your AI agent on your website to learn your voice, style, and knowledge base.
                </p>
            </header>

            {/* Training Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Knowledge Source
                </h2>
                <div className="flex gap-4">
                    <input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isTraining}
                        className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={runTraining}
                        disabled={isTraining}
                        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isTraining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {isTraining ? "Training..." : "Train Agent"}
                    </button>
                </div>

                {/* Logs Console */}
                {logs.length > 0 && (
                    <div className="mt-4 p-4 bg-black/5 dark:bg-black/50 rounded-lg font-mono text-xs max-h-32 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 text-zinc-600 dark:text-zinc-400 border-l-2 border-purple-500 pl-2">
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Voice Profile Display */}
            {voice.tone && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Archetype Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            <h3 className="font-bold text-purple-900 dark:text-purple-100">Brand Archetype</h3>
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                            {voice.archetype}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {voice.description}
                        </p>
                    </div>

                    {/* Tone Traits */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Layout className="w-6 h-6 text-zinc-500" />
                            <h3 className="font-bold">Voice Traits</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {voice.adjectives?.map((adj: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-xs font-medium border border-zinc-200 dark:border-white/10">
                                    {adj}
                                </span>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Tone</div>
                                <div className="text-sm font-medium">{voice.tone}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Style</div>
                                <div className="text-sm font-medium">{voice.communication_style}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
