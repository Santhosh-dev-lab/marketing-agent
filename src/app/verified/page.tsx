"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function VerifiedPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard after a short delay to let the user see the success message
        const timer = setTimeout(() => {
            router.push("/");
            router.refresh();
        }, 2500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030303] text-zinc-900 dark:text-white px-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-[0.1]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md text-center"
            >
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h1 className="text-3xl font-bold mb-4 tracking-tight">Email Verified!</h1>
                <p className="text-zinc-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
                    Your account has been successfully verified. You are now being redirected to your dashboard.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting...</span>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm text-zinc-400 dark:text-neutral-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        Click here if not redirected <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
