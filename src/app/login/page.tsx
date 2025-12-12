"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false); // For full screen overlay
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isMagicLink, setIsMagicLink] = useState(false); // Toggle for OTP Login
    const [emailSentState, setEmailSentState] = useState(false); // Dedicated state for email sent view
    const [otp, setOtp] = useState(""); // OTP state

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorMsg = params.get('error');
        const viewParam = params.get('view'); 

        if (errorMsg) {
            setError(decodeURIComponent(errorMsg));
        }
        if (viewParam === 'signup') {
            setIsSignUp(true);
        }
        if (params.get('verified') === 'true') {
            setError("Email successfully verified! Please log in.");
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Client-side password validation
                const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                if (!strongPasswordRegex.test(password)) {
                    setError("Password is too weak. Please use at least 8 characters, including uppercase, lowercase, numbers, and symbols.");
                    setIsLoading(false);
                    return;
                }
                const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${origin}/auth/callback?email=${encodeURIComponent(email)}`,
                    },
                });
                if (error) throw error;
                setEmailSentState(true);

            } else if (isMagicLink) {
                // Handle Magic Link (OTP) Login
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        shouldCreateUser: false, 
                    }
                });
                if (error) throw error;
                setEmailSentState(true); 

            } else {
                // Password Login
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
            let msg = err.message;
            if (msg.includes("Invalid login credentials")) {
                msg = "Incorrect password. If you signed up with Google, please use the button above or request a login code.";
            } else if (msg.includes("User not found") || msg.includes("Signups not allowed")) {
                 msg = "Account not found. Please Sign Up first.";
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
            // For Verify OTP, we try 'signup' if we are in signup confirmation mode
            // Or 'magiclink'/'email' if we are in login mode.
            // But signInWithOtp sends a 'magiclink' (email) type usually with `otp`? 
            // Actually `verifyOtp({ type: 'magiclink', token })` works for links. For codes, it's usually `type: 'email'`.
            // Supabase recently unified these.
            
            // Determine the correct verification type
            // 'signup' for new users, 'magiclink' for passwordless login (existing users)
            const type = isSignUp ? 'signup' : 'magiclink'; 

            console.log(`Verifying OTP: ${email}, ${otp}, type: ${type}`);

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: type 
            });

            // Fallback for edge cases where 'email' might be required (unlikely for login, but safe)
            if (error) {
                console.warn("First verify failed, trying fallback type: email");
                 const { error: error2 } = await supabase.auth.verifyOtp({
                    email,
                    token: otp,
                    type: 'email'
                });
                if (error2) throw error;
            }

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
                                {/* Google Button */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';
                                        const intent = isSignUp ? 'signup' : 'signin';
                                        document.cookie = `auth_intent=${intent}; path=/; max-age=300`;

                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: `${origin}/auth/callback`, 
                                                queryParams: { access_type: 'offline', prompt: 'consent' },
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
                                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                                            Or continue with {isMagicLink ? "Logic Code" : "email"}
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

                                    {/* Password Field - Only if NOT Magic Link */}
                                    {!isMagicLink && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-xs font-semibold text-zinc-700 dark:text-neutral-300 ml-1 uppercase tracking-wider">Password</label>
                                                {!isSignUp && (
                                                    <button type="button" onClick={() => { setIsMagicLink(true); setError(null); }} className="text-xs text-purple-600 hover:text-purple-500 font-medium">
                                                        Forgot password / Login with Verify Code
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-3.5 text-zinc-400 dark:text-neutral-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="password"
                                                    required={!isMagicLink}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white dark:bg-[#1A1A1A] border border-zinc-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 pl-10 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-zinc-400 dark:hover:border-neutral-700 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-neutral-600 shadow-sm"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Link to Toggle Magic Link Mode */}
                                    {!isSignUp && isMagicLink && (
                                        <div className="flex justify-end">
                                             <button type="button" onClick={() => { setIsMagicLink(false); setError(null); }} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                                Use Password instead
                                            </button>
                                        </div>
                                    )}

                                    {isSignUp && password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="space-y-2 pt-2"
                                        >
                                            {/* (Password Strength Indicator) */}
                                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Password strength:</p>
                                             <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { label: "8+ chars", valid: password.length >= 8 },
                                                    { label: "Lowercase", valid: /[a-z]/.test(password) },
                                                    { label: "Uppercase", valid: /[A-Z]/.test(password) },
                                                    { label: "Number", valid: /\d/.test(password) },
                                                    { label: "Symbol", valid: /[\W_]/.test(password) },
                                                ].map((req, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.valid ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                                                            {req.valid && <CheckCircle2 className="w-3 h-3" />}
                                                        </div>
                                                        <span className={req.valid ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600'}>
                                                            {req.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
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
                                            {isSignUp ? "Create Account" : (isMagicLink ? "Send Login Code" : "Sign In")}
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
                                            setIsMagicLink(false);
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

             {/* Right Side: Branding (Lottie Animation) */}
             <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-[#020202] items-center justify-center p-12 border-l border-zinc-800">
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Radial Soft Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#050505] to-[#020202]" />
                    
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.15] invert dark:invert-0 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_70%)]" />
                    
                    {/* Animated Aurora Blobs */}
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/30 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
                    <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                 </div>
                 
                 <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
                    {/* Lottie Animation Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-[500px] aspect-[4/3] mb-10 flex items-center justify-center"
                    >
                        <LottieAnimation />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight text-white leading-tight">
                            Marketing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                                Autopilot
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
                            "The most powerful tool for modern brands to automate strategy and content."
                        </p>
                    </motion.div>
                 </div>
            </div>
        </div>
    );
}

function LottieAnimation() {
    const defaultOptions = {
        loop: true,
        autoplay: true, 
        path: '/animation.json', // User will place file here
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    // We use a dynamic import for Lottie to avoid SSR issues if any, 
    // but lottie-react works fine usually. 
    // However, since we need to fetch the JSON or just use the player, let's use the component.
    // NOTE: lottie-react component takes `animationData`. 
    // If we want to use a URL path (like /animation.json), we might need to fetch it or use a player that supports paths.
    // lottie-react's `Lottie` component primarily takes `animationData` (json object).
    // To support a path from public folder, we can fetch it or just instruct user to replace the import.
    // BUT the user said "i will place that animation json in public folder".
    // Many Lottie libs support `path` prop. `lottie-react` (v2) uses `animationData`.
    // Let's try to fetch it or just use a placeholder if they haven't put it there yet.
    // actually `lottie-web` supports path. `lottie-react` wraps it.
    
    // Let's implement a safe fetcher for the client side.
    
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch('/animation.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then(data => setAnimationData(data))
            .catch(err => console.log("Waiting for animation.json in /public..."));
    }, []);

    if (!animationData) return <div className="w-full h-full flex items-center justify-center text-zinc-800">Animation Placeholder</div>;

    const Lottie = require("lottie-react").default;
    return <Lottie animationData={animationData} loop={true} />;
}
