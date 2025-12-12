import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black text-zinc-900 dark:text-white">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 blur-xl opacity-20 animate-pulse rounded-full" />
                    <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin relative z-10" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse">
                    Loading Marketing Agent...
                </p>
            </div>
        </div>
    );
}
