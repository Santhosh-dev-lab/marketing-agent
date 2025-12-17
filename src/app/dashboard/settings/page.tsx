"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BrandSettingsEditor } from "@/components/brand-settings-editor";
import { Loader2, Lock, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [brandId, setBrandId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchBrand() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Use maybeSingle to avoid 406 error if no brand exists
                const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).maybeSingle();
                if (brand) {
                    setBrandId(brand.id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBrand();
    }, []);



    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    // Allow rendering Editor even if brandId is null (Create Mode)

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Strategy Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Manage the core intelligence that powers your AI agent. Updating these details will refine future content generation.
                </p>
            </div>

            <BrandSettingsEditor brandId={brandId} />

            {/* Account Security Moved to Profile Menu */}


        </div>
    );
}
