"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";
import { getURL } from "@/lib/utils";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false); // For full screen overlay
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [emailSentState, setEmailSentState] = useState(false); // Dedicated state for email sent view

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${origin}/auth/callback?next=/verified`,
                    },
                });
                if (error) throw error;
                setEmailSentState(true);

                // Polling for verification
                if (data.session) {
                    const interval = setInterval(async () => {
                        try {
                            const { data: { session }, error } = await supabase.auth.refreshSession();
                            if (error) {
                                console.log("Refresh error, ignoring:", error.message);
                                return;
                            }
                            // If we have a verified email, redirect
                            if (session?.user?.email_confirmed_at) {
                                clearInterval(interval);
                                setIsGlobalLoading(true);
                                router.push("/");
                                router.refresh();
                            }
                        } catch (e) {
                            console.error("Polling error:", e);
                        }
                    }, 2000);
                }

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setIsGlobalLoading(true);
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh for Verified Users
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email_confirmed_at) {
                setIsGlobalLoading(true);
                router.push("/");
                router.refresh();
            }
        };
        checkUser();
    }, [router, supabase]);

    return (
        <div className="min-h-screen flex bg-white dark:bg-[#030303] text-zinc-900 dark:text-white selection:bg-purple-500/30 font-sans transition-colors duration-300">
            {/* Global Loading Overlay */}
            <AnimatePresence>
                {isGlobalLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/90 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
                                Securely logging you in...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Side: Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 lg:px-20 relative z-10"
            >
                <div className="w-full max-w-[400px] space-y-8">
                    {!emailSentState ? (
                        <>
                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-neutral-400 pb-1">
                                    {isSignUp ? "Join the Force" : "Welcome Back"}
                                </h2>
                                <p className="text-base text-zinc-500 dark:text-neutral-400">
                                    {isSignUp
                                        ? "Start automating your marketing today."
                                        : "Sign in to access your autonomous agent."}
                                </p>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-neutral-300 ml-1 uppercase tracking-wider">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-3.5 text-zinc-400 dark:text-neutral-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 pl-10 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-zinc-400 dark:hover:border-neutral-700 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-neutral-600 shadow-sm"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-neutral-300 ml-1 uppercase tracking-wider">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-3.5 text-zinc-400 dark:text-neutral-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 pl-10 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-zinc-400 dark:hover:border-neutral-700 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-neutral-600 shadow-sm"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-sm px-4 py-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-neutral-200 active:scale-95 transition-all duration-200 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isSignUp ? "Create Account" : "Sign In"}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-neutral-800 to-transparent mb-6" />
                                <p className="text-sm text-zinc-500 dark:text-neutral-500">
                                    {isSignUp ? "Already a member?" : "New to Marketing Agent?"}{" "}
                                    <button
                                        onClick={() => {
                                            setIsSignUp(!isSignUp);
                                            setError(null);
                                        }}
                                        className="text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors ml-1"
                                    >
                                        {isSignUp ? "Sign In" : "Create Account"}
                                    </button>
                                </p>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-50 dark:bg-[#1A1A1A] p-8 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center"
                        >
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check your inbox</h3>
                            <p className="text-sm text-zinc-600 dark:text-gray-400 mb-6 font-medium">
                                We've sent a verification link to <span className="text-zinc-900 dark:text-white font-semibold">{email}</span>.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-neutral-500 mb-6 bg-zinc-100 dark:bg-black/40 py-2 rounded-lg">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Waiting for verification...</span>
                            </div>
                            <div className="text-xs text-zinc-400">
                                <button onClick={() => window.location.reload()} className="underline hover:text-zinc-900 dark:hover:text-white mb-2 block w-full">I've verified, refresh page</button>
                                <button onClick={() => setEmailSentState(false)} className="hover:text-zinc-900 dark:hover:text-white">Use a different email</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Right Side: Branding */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-zinc-50 dark:bg-[#0A0A0A] items-center justify-center p-12 border-l border-zinc-200 dark:border-white/5">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/10 dark:bg-purple-600/20 opacity-40 blur-[120px] rounded-full animate-pulse-slow mix-blend-screen" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-600/10 opacity-40 blur-[120px] rounded-full mix-blend-screen" />
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                        className="backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 p-10 rounded-3xl shadow-2xl"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 mb-8 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M12 2v20M2 12h20M12 2l4 4M12 22l-4-4" /></svg>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-zinc-900 dark:text-white">
                            Marketing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-zinc-900 dark:from-purple-400 dark:via-pink-400 dark:to-white">
                                Autopilot.
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-neutral-400 leading-relaxed mb-8">
                            "The most powerful tool for modern brands. It feels less like software and more like a creative partner."
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-2">
                            {['Brand Twin™', 'Auto-Scheduler', 'AI Copywriting', 'Asset Locker'].map((tag, i) => (
                                <div key={i} className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-600 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors cursor-default">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
