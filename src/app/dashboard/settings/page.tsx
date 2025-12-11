"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bot, Save, Sparkles } from "lucide-react";

const AGENT_TYPES = [
    { id: 'strategy', name: 'Strategy Agent', desc: 'Plans campaigns using RAG' },
    { id: 'content', name: 'Content Agent', desc: 'Writes copy and captions' },
    { id: 'visual', name: 'Visual Agent', desc: 'Generates images and assets' },
    { id: 'brand_twin', name: 'Brand Twin', desc: 'Analyzes voice and context' },
];

export default function SettingsPage() {
    const [configs, setConfigs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state maps agent_type -> { instructions }
    const [formState, setFormState] = useState<Record<string, { instructions: string }>>({});

    const supabase = createClient();

    useEffect(() => {
        fetchConfigs();
    }, []);

    // Helper to get or create brand safely (Read-First Pattern with Self-Healing)
    const getOrCreateBrand = async (userId: string) => {
        try {
            // 1. Try to find EXISTING brand first (Read-only, quiet)
            const { data: existing } = await supabase
                .from('brands')
                .select('id')
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
                .select('id')
                .single();

            if (newBrand) return newBrand;

            if (error) {
                // Handle FK Violation (23503): Missing Profile
                // This happens if the user exists in Auth but not in public.profiles
                if (error.code === '23503') {
                    console.warn("Profile missing. Auto-healing...");
                    // 3. Create missing Profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({ id: userId });

                    if (!profileError) {
                        // 4. Retry Brand Creation after Profile Fix
                        const { data: retryBrand } = await supabase
                            .from('brands')
                            .upsert(
                                { name: 'My Launchpad Brand', user_id: userId },
                                { onConflict: 'user_id', ignoreDuplicates: false }
                            )
                            .select('id')
                            .single();
                        if (retryBrand) return retryBrand;
                    } else {
                        console.error("Failed to auto-heal profile:", profileError);
                    }
                }

                // Final attempted fetch if upsert erroneously failed
                const { data: final } = await supabase
                    .from('brands')
                    .select('id')
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

    const fetchConfigs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const brand = await getOrCreateBrand(user.id);
        if (!brand) return;

        const { data } = await supabase
            .from('agent_configs')
            .select('*')
            .eq('brand_id', brand.id);

        const newConfigs: Record<string, any> = {};
        const newForm: Record<string, any> = {};

        data?.forEach((conf: any) => {
            newConfigs[conf.agent_type] = conf;
            newForm[conf.agent_type] = {
                instructions: conf.settings?.custom_instructions || ''
            };
        });

        // Initialize missing
        AGENT_TYPES.forEach(t => {
            if (!newForm[t.id]) newForm[t.id] = { instructions: '' };
        });

        setConfigs(newConfigs);
        setFormState(newForm);
        setLoading(false);
    };

    const handleSave = async (agentType: string) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const brand = await getOrCreateBrand(user?.id!);

            if (!brand) throw new Error("Could not retrieve brand record");

            const config = formState[agentType];

            // Upsert config
            const { error } = await supabase
                .from('agent_configs')
                .upsert({
                    brand_id: brand.id,
                    agent_type: agentType,
                    // We now default to managed keys, so we don't store api_key_encrypted from user
                    settings: {
                        ...configs[agentType]?.settings,
                        custom_instructions: config.instructions
                    },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'brand_id, agent_type' });

            if (error) throw error;
            alert(`Saved settings for ${agentType}`);
            fetchConfigs(); // Refresh

        } catch (e: any) {
            alert("Error saving: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Configure your agent's behavior and personality.</p>
            </header>

            <div className="grid gap-8">
                {/* Agent Configuration Section */}
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        Agent Configuration
                    </h2>
                    <div className="grid gap-4">
                        {AGENT_TYPES.map(agent => (
                            <div key={agent.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{agent.name}</h3>
                                        <p className="text-sm text-zinc-500">{agent.desc}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${configs[agent.id]?.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                        Active
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Custom Instructions
                                    </label>
                                    <textarea
                                        placeholder="E.g. Always use a friendly tone, avoid hashtags on LinkedIn..."
                                        value={formState[agent.id]?.instructions || ""}
                                        onChange={(e) => setFormState(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], instructions: e.target.value } }))}
                                        className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-purple-500/50 min-h-[100px] text-sm"
                                    />
                                    <p className="text-xs text-zinc-400 mt-2">
                                        These instructions will be prepended to the system prompt for this agent.
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => handleSave(agent.id)}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-90"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Behavior
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
