"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Save, Loader2, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Status states
    const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
            setEmail(user.email || "");
            setIsLoading(false);
        }
        fetchUser();
    }, [router]);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailStatus({ type: null, msg: "" });
        setIsUpdatingEmail(true);

        try {
            if (email === user.email) {
                setEmailStatus({ type: 'error', msg: "New email must be different from current email." });
                return;
            }

            const { error } = await supabase.auth.updateUser({ email });
            if (error) throw error;
            
            setEmailStatus({ 
                type: 'success', 
                msg: "Confirmation link sent to both old and new email addresses. Please verify to complete the change." 
            });
        } catch (error: any) {
            setEmailStatus({ type: 'error', msg: error.message });
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordStatus({ type: null, msg: "" });

        if (password.length < 6) {
            setPasswordStatus({ type: 'error', msg: "Password must be at least 6 characters." });
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setPasswordStatus({ type: 'success', msg: "Password updated successfully!" });
            setPassword("");
        } catch (error: any) {
            setPasswordStatus({ type: 'error', msg: error.message });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Header & Back Button */}
                <div className="space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Account Security</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            Manage your login credentials and recovery options.
                        </p>
                    </div>
                </div>

                {/* Email Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Email Address</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Your email is used for login and notifications.
                                </p>
                            </div>

                            <form onSubmit={handleUpdateEmail} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-500 mb-1.5 block">Current Email</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                {emailStatus.msg && (
                                    <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${emailStatus.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                        {emailStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        {emailStatus.msg}
                                    </div>
                                )}
                                
                                {user.email !== email && (
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-lg text-xs">
                                        <AlertTriangle className="w-4 h-4" />
                                        Changing email requires re-verification of both addresses.
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isUpdatingEmail || user.email === email}
                                    className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm ml-auto"
                                >
                                    {isUpdatingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Email
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* Password Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Password</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Set a robust password to secure your account.
                                </p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-500 mb-1.5 block">New Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                                    />
                                </div>

                                {passwordStatus.msg && (
                                    <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${passwordStatus.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                        {passwordStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        {passwordStatus.msg}
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={!password || isUpdatingPassword}
                                    className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm ml-auto"
                                >
                                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
