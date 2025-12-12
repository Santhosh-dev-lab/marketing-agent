"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandStrategyForm } from "@/components/brand-strategy-form";
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
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Welcome to MarketingAgent</h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">
                        Let's calibrate your AI Chief Marketing Officer. Tell us about your brand, and we'll build your strategy.
                    </p>
                </div>

                <BrandStrategyForm 
                    brandId={brandId} 
                    onComplete={() => {
                        router.push('/dashboard/strategy?new=true'); // We'll create this next
                    }} 
                />
            </div>
        </div>
    );
}
