"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TasksView } from "@/components/tasks-view";
import { Loader2 } from "lucide-react";

export default function TasksPage() {
    const [brandId, setBrandId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUserId(user.id);
                
                // Use maybeSingle to prevent 406 if no brand exists
                const { data: brand } = await supabase
                    .from('brands')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                
                if (brand) setBrandId(brand.id);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Only show loader while actually fetching
    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-zinc-300" /></div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 pt-24 font-sans">
            <div className="max-w-7xl mx-auto">
                <TasksView brandId={brandId} userId={userId} />
            </div>
        </div>
    );
}
