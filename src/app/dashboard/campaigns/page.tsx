"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Box, Plus, Calendar, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Creation Form State
    const [goal, setGoal] = useState("");
    const [dateRange, setDateRange] = useState("Next 30 Days");
    const [generating, setGenerating] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchCampaigns();
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

    const fetchCampaigns = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const brand = await getOrCreateBrand(user.id);
        if (!brand) return;

        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('brand_id', brand.id)
            .order('created_at', { ascending: false });

        if (data) setCampaigns(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!goal) return;
        setGenerating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const brand = await getOrCreateBrand(user?.id!); // Use safe getter

            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-campaign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brand_id: brand?.id,
                    goal: goal,
                    date_range: dateRange
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Refresh and close
            await fetchCampaigns();
            setIsCreating(false);
            setGoal("");

        } catch (e: any) {
            alert("Failed to generate campaign: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Campaigns</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your autonomous marketing campaigns.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 text-sm font-medium rounded-full shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </header>

            {/* Creation Wizard */}
            {isCreating && (
                <div className="mb-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Create Autonomous Campaign
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Campaign Goal</label>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g. Launch our new Summer Collection and drive 20% more sales to the website."
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-purple-500/50 min-h-[100px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Timing</label>
                            <input
                                type="text"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 ring-purple-500/50"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={generating || !goal}
                            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Strategizing...
                                </>
                            ) : (
                                <>
                                    Generate Plan
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Campaign List */}
            {loading ? (
                <div className="text-center py-20 text-zinc-500">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
                <div className="w-full h-96 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm border-dashed">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                        <Box className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No active campaigns</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
                        Start by creating a new campaign. Our AI agents will plan and execute it for you.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {campaigns.map((camp) => (
                        <div key={camp.id} className="p-6 rounded-2xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{camp.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${camp.status === 'active' ? 'bg-green-100 text-green-700' :
                                            camp.status === 'completed' ? 'bg-zinc-100 text-zinc-600' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {camp.status}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 line-clamp-2 max-w-2xl">{camp.goal}</p>
                                </div>
                                <div className="p-2 rounded-full bg-zinc-50 dark:bg-white/5 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 text-zinc-400 group-hover:text-purple-600 transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(camp.created_at).toLocaleDateString()}
                                </div>
                                <div>30 Day Plan</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
