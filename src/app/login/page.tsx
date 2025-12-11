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
    const [otp, setOtp] = useState(""); // OTP state

    const router = useRouter();
    const supabase = createClient();
    // Move access to searchParams inside useEffect or useSearchParams hook to be safe, but for now accessing via window in useEffect is safer for hydration

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorMsg = params.get('error');
        const viewParam = params.get('view'); // Check for view param (e.g. 'signup')

        // Handle Errors from URL
        if (errorMsg) {
            setError(decodeURIComponent(errorMsg));
        }

        // Handle View Switching (e.g. force signup view)
        if (viewParam === 'signup') {
            setIsSignUp(true);
        }

        if (params.get('verified') === 'true') {
            setError("Email successfully verified! Please log in.");
            // Optional: change style of error to success
        }
    }, []);

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
                        emailRedirectTo: `${origin}/auth/callback?email=${encodeURIComponent(email)}`,
                    },
                });
                if (error) throw error;
                setEmailSentState(true);
                // Polling removed in favor of OTP check

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
            // Customize error messages
            let msg = err.message;
            if (msg.includes("Invalid login credentials")) {
                msg = "Account not found or incorrect password. If you are new, please Sign Up.";
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error;

            setIsGlobalLoading(true);
            router.push("/");
            router.refresh();
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


            {/* Left Side: Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 lg:px-20 relative z-10"
            >
                <div className="w-full max-w-[400px] space-y-8 relative">
                    {/* Scoped Loading Overlay */}
                    <AnimatePresence>
                        {isGlobalLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl"
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

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';

                                        // Set cookie for strict auth intent (valid for 5 minutes)
                                        const intent = isSignUp ? 'signup' : 'signin';
                                        document.cookie = `auth_intent=${intent}; path=/; max-age=300`;

                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${origin}/auth/callback`, // Clean URL to match Supabase allow list
                                                queryParams: {
                                                    access_type: 'offline',
                                                    prompt: 'consent',
                                                },
                                            },
                                        });
                                        if (error) {
                                            setError(error.message);
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-neutral-800 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-neutral-800 hover:border-zinc-300 dark:hover:border-neutral-700 font-bold rounded-xl py-3.5 flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-95"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-200 dark:border-neutral-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-[#030303] px-2 text-zinc-400 dark:text-neutral-500 font-medium">
                                            Or continue with email
                                        </span>
                                    </div>
                                </div>
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
                                        className={`text-sm px-4 py-3 rounded-lg border ${error.includes('verified') ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20'}`}
                                    >
                                        {error.includes('verified') && <CheckCircle2 className="w-4 h-4 inline mr-2 -mt-0.5" />}
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
                                We've sent a verification code to <span className="text-zinc-900 dark:text-white font-semibold">{email}</span>.
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                    placeholder="123456"
                                    maxLength={6}
                                />
                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-neutral-200 font-bold rounded-xl py-3 transition-all duration-200 text-sm shadow-sm flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                                </button>
                            </form>

                            <button
                                onClick={() => {
                                    setIsSignUp(false);
                                    setEmailSentState(false);
                                    setError(null);
                                    setOtp("");
                                }}
                                className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2"
                            >
                                Back to Login
                            </button>
                        </motion.div>


                    )
                    }
                </div >
            </motion.div >

            {/* Right Side: Branding */}
            < div className="hidden lg:flex w-[55%] relative overflow-hidden bg-zinc-50 dark:bg-[#0A0A0A] items-center justify-center p-12 border-l border-zinc-200 dark:border-white/5" >
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
            </div >
        </div >
    );
}
