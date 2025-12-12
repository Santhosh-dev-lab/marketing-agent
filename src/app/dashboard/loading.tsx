import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Thinking...
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Preparing your workspace
                    </p>
                </div>
            </div>
        </div>
    );
}
