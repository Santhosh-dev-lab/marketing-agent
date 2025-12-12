"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandSettingsEditor } from "@/components/brand-settings-editor";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
    const [brandId, setBrandId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) return;
            const { data: brand } = await supabase.from('brands').select('id, audience_persona').eq('user_id', user.id).single();
            
            if (brand) {
                // If already has persona, skip to dashboard
                if (brand.audience_persona && Object.keys(brand.audience_persona).length > 0) {
                     router.push('/dashboard');
                } else {
                    setBrandId(brand.id);
                }
            }
        }
        init();
    }, []);

    if (!brandId) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6">
            <div className="max-w-6xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Welcome to MarketingAgent</h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">
                        Let's calibrate your AI Chief Marketing Officer. Tell us about your brand, and we'll build your strategy.
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
                    <BrandSettingsEditor brandId={brandId} />
                </div>
                
                <div className="flex justify-center pt-8">
                     <button 
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        Skip for now &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
