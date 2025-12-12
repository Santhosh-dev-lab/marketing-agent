"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Building2, UserCircle2, Sparkles, Share2, ShieldAlert, Palette, Upload, CloudLightning } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

// Define shapes matching the DB
interface BrandSettingsData {
    // Basics
    name?: string;
    website?: string;
    industry?: string;
    location?: string;
    
    // Audience
    audience_persona?: { demographics: string; pain_points: string[] };
    primary_goal?: string;

    // Voice
    voice_settings?: { slogan: string };
    tone_voice?: string;
    emoji_usage?: string;
    language?: string;
    key_adjectives?: string[];
    brand_values?: string[];


    // Socials
    social_handles?: { instagram?: string; twitter?: string; linkedin?: string };

    // Integrations (API Keys)
    api_config?: {
        serpapi?: { api_key: string };
        instagram?: { access_token: string };
        twitter?: { bearer_token: string };
        youtube?: { api_key: string };
        facebook?: { page_access_token: string };
    };

    // Safety
    forbidden_words?: string[];

    competitors?: { name: string }[];

    // Visuals
    brand_color?: string;
    logo_url?: string; // We'll handle upload logic
}

const INDUSTRY_OPTIONS = ["Retail", "Food & Bev", "Tech", "Health", "Fashion", "Services"];
const GOAL_OPTIONS = ["Brand Awareness", "Driving Sales", "Community Building", "Education"];
const TONE_OPTIONS = ["Professional", "Witty", "Friendly", "Luxury", "Urgent/Hype"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "Hindi", "German"];


export function BrandSettingsEditor({ brandId }: { brandId: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("basics");
    const [isSaving, setIsSaving] = useState(false);
    
    const supabase = createClient();
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>();

    const industry = watch('industry');
    const primaryGoal = watch('primary_goal');
    const toneVoice = watch('tone_voice');
    const language = watch('language');


    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: brand, error } = await supabase.from('brands').select('*').eq('id', brandId).single();
                if (error) throw error;

                // Map flat DB fields to form structure if needed, or just pass directly
                // We'll flatten slightly for the form to make inputs easier
                reset({
                    name: brand.name,
                    website: brand.website,
                    industry: brand.industry || "Retail",
                    location: brand.location,
                    
                    audience_demographics: brand.audience_persona?.demographics,
                    audience_pain_points: (brand.audience_persona?.pain_points || []).join(', '),
                    primary_goal: brand.primary_goal || "Brand Awareness",

                    slogan: brand.voice_settings?.slogan,
                    tone_voice: brand.tone_voice || "Professional",
                    emoji_usage: brand.emoji_usage || "Minimal",
                    language: brand.language || "English",
                    key_adjectives: (brand.key_adjectives || []).join(', '),
                    brand_values: (brand.brand_values || []).join(', '),

                    instagram: brand.social_handles?.instagram,
                    twitter: brand.social_handles?.twitter,
                    linkedin: brand.social_handles?.linkedin,

                    // Integrations
                    serpapi_key: brand.api_config?.serpapi?.api_key,
                    ig_token: brand.api_config?.instagram?.access_token,
                    x_token: brand.api_config?.twitter?.bearer_token,
                    yt_key: brand.api_config?.youtube?.api_key,
                    fb_token: brand.api_config?.facebook?.page_access_token,

                    forbidden_words: (brand.forbidden_words || []).join(', '),
                    competitors: (brand.competitors || []).map((c: any) => c.name).join(', '),
                    
                    brand_color: brand.brand_color || "#000000",
                });
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [brandId, reset]);

    const onSubmit = async (formData: any) => {
        setIsSaving(true);
        try {
            // Re-nest data for DB
            const payload = {
                name: formData.name,
                website: formData.website,
                industry: formData.industry,
                location: formData.location,

                audience_persona: {
                    demographics: formData.audience_demographics,
                    pain_points: formData.audience_pain_points.split(',').map((s: string) => s.trim()).filter(Boolean)
                },
                primary_goal: formData.primary_goal,

                voice_settings: { slogan: formData.slogan },
                tone_voice: formData.tone_voice,
                emoji_usage: formData.emoji_usage,
                language: formData.language,
                key_adjectives: formData.key_adjectives.split(',').map((s: string) => s.trim()).filter(Boolean),
                brand_values: formData.brand_values.split(',').map((s: string) => s.trim()).filter(Boolean),

                social_handles: {
                    instagram: formData.instagram,
                    twitter: formData.twitter,
                    linkedin: formData.linkedin
                },
                
                api_config: {
                    serpapi: { api_key: formData.serpapi_key },
                    instagram: { access_token: formData.ig_token },
                    twitter: { bearer_token: formData.x_token },
                    youtube: { api_key: formData.yt_key },
                    facebook: { page_access_token: formData.fb_token }
                },

                forbidden_words: formData.forbidden_words.split(',').map((s: string) => s.trim()).filter(Boolean),
                competitors: formData.competitors.split(',').map((s: string) => ({ name: s.trim() })).filter(Boolean),

                brand_color: formData.brand_color
            };

            const { error } = await supabase.from('brands').update(payload).eq('id', brandId);
            if (error) throw error;
            
            // Show success toast (basic alert for now)
            alert("Settings saved successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "basics", label: "Basics", icon: Building2 },
        { id: "audience", label: "Audience", icon: UserCircle2 },
        { id: "voice", label: "Brand Voice", icon: Sparkles },
        { id: "socials", label: "Social Media", icon: Share2 },
        { id: "integrations", label: "Integrations", icon: CloudLightning },
        { id: "safety", label: "Safety", icon: ShieldAlert },
        { id: "visuals", label: "Visuals", icon: Palette },
    ];

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 shrink-0 space-y-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                            activeTab === tab.id 
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-zinc-500/10" 
                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Main Form Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                    
                    {/* Basics Tab */}
                    {activeTab === "basics" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-500" />
                                Core Business Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Business Name</label>
                                    <input {...register('name')} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Industry</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <select 
                                                value={INDUSTRY_OPTIONS.includes(industry) ? industry : "Other"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Other") setValue("industry", ""); 
                                                    else setValue("industry", val);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        {(!INDUSTRY_OPTIONS.includes(industry) && industry !== undefined) && (
                                             <input 
                                                value={industry}
                                                onChange={(e) => setValue("industry", e.target.value)}
                                                placeholder="Enter custom industry..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-400"
                                             />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Website URL</label>
                                    <div className="flex gap-2">
                                        <input {...register('website')} placeholder="https://" className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-400" />
                                        <button 
                                            type="button"
                                            onClick={async () => {
                                                const url = watch('website');
                                                if (!url) return alert("Please enter a website URL first.");
                                                
                                                const btn = document.getElementById('analyze-btn');
                                                if(btn) { btn.innerHTML = 'Analyzing...'; (btn as HTMLButtonElement).disabled = true; }

                                                try {
                                                    const { data: { session } } = await supabase.auth.getSession();
                                                    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-website`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${session?.access_token}`
                                                        },
                                                        body: JSON.stringify({ brand_id: brandId, website_url: url })
                                                    });
                                                    const json = await res.json();
                                                    if (json.error) throw new Error(json.error);
                                                    alert(`Success! Generated ${json.tasks?.length} new tasks based on your website.`);
                                                } catch (e) {
                                                    alert(`Analysis failed: ${e instanceof Error ? e.message : String(e)}`);
                                                } finally {
                                                    if(btn) { btn.innerHTML = '✨ Analyze'; (btn as HTMLButtonElement).disabled = false; }
                                                }
                                            }}
                                            id="analyze-btn"
                                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Analyze
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Location/City</label>
                                    <input {...register('location')} placeholder="e.g. New York, NY" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audience Tab */}
                    {activeTab === "audience" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <UserCircle2 className="w-5 h-5 text-blue-500" />
                                Target Audience
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Who is your customer?</label>
                                    <textarea {...register('audience_demographics')} rows={3} placeholder="e.g. Corporate Professionals, 25-40, interest in productivity tools..." className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 resize-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Primary Goal</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <select 
                                                value={GOAL_OPTIONS.includes(primaryGoal) ? primaryGoal : "Other"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Other") setValue("primary_goal", "");
                                                    else setValue("primary_goal", val);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {GOAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        {(!GOAL_OPTIONS.includes(primaryGoal) && primaryGoal !== undefined) && (
                                            <input 
                                                value={primaryGoal}
                                                onChange={(e) => setValue("primary_goal", e.target.value)}
                                                placeholder="Enter custom goal..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Pain Points (Comma separated)</label>
                                    <textarea {...register('audience_pain_points')} rows={2} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voice Tab */}
                    {activeTab === "voice" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Brand Voice & Personality
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Tone of Voice</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <select 
                                                value={TONE_OPTIONS.includes(toneVoice) ? toneVoice : "Other"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Other") setValue("tone_voice", "");
                                                    else setValue("tone_voice", val);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        {(!TONE_OPTIONS.includes(toneVoice) && toneVoice !== undefined) && (
                                            <input 
                                                value={toneVoice}
                                                onChange={(e) => setValue("tone_voice", e.target.value)}
                                                placeholder="Enter custom tone..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Emoji Usage</label>
                                    <div className="relative">
                                        <select {...register('emoji_usage')} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="None">None 🚫</option>
                                            <option value="Minimal">Minimal 👌</option>
                                            <option value="Heavy">Heavy 🔥🚀✨</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Language</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <select 
                                                value={LANGUAGE_OPTIONS.includes(language) ? language : "Other"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "Other") setValue("language", "");
                                                    else setValue("language", val);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                         {(!LANGUAGE_OPTIONS.includes(language) && language !== undefined) && (
                                            <input 
                                                value={language}
                                                onChange={(e) => setValue("language", e.target.value)}
                                                placeholder="Enter custom language..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Slogan</label>
                                    <input {...register('slogan')} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Key Adjectives (3-5 words)</label>
                                <input {...register('key_adjectives')} placeholder="e.g. Sustainable, Premium, Cozy" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Core Values (Comma separated)</label>
                                <textarea {...register('brand_values')} rows={2} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400 resize-none" />
                            </div>
                        </div>
                    )}

                    {/* Socials Tab */}
                    {activeTab === "socials" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <Share2 className="w-5 h-5 text-pink-500" />
                                Social Media Handles
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Instagram</label>
                                    <div className="flex">
                                        <span className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-zinc-500 font-medium">@</span>
                                        <input {...register('instagram')} className="flex-1 px-4 py-2.5 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-zinc-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Twitter / X</label>
                                    <div className="flex">
                                        <span className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-zinc-500 font-medium">@</span>
                                        <input {...register('twitter')} className="flex-1 px-4 py-2.5 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-zinc-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">LinkedIn URL</label>
                                    <input {...register('linkedin')} placeholder="https://linkedin.com/company/..." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all placeholder:text-zinc-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Tab */}
                    {activeTab === "safety" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                Constraints & Safety
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Forbidden Words</label>
                                    <textarea {...register('forbidden_words')} rows={2} placeholder="e.g. Cheap, Discount, Boring" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-zinc-400 resize-none" />
                                    <p className="text-xs text-zinc-400">Words the AI must never use.</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Competitor Names</label>
                                    <textarea {...register('competitors')} rows={2} placeholder="e.g. Competitor X, BigCorp" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-zinc-400 resize-none" />
                                    <p className="text-xs text-zinc-400">To ensure we don't accidentally mention them.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Visuals Tab */}
                    {activeTab === "visuals" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <Palette className="w-5 h-5 text-indigo-500" />
                                Visual Identity
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Brand Color</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="relative">
                                            <input type="color" {...register('brand_color')} className="w-12 h-12 p-0 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 cursor-pointer overflow-hidden" />
                                        </div>
                                        <input {...register('brand_color')} className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white uppercase font-mono shadow-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Logo Upload</label>
                                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group bg-zinc-50/50 dark:bg-black/20">
                                        <div className="p-4 bg-white dark:bg-zinc-800 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-purple-600" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Click to upload logo</p>
                                        <p className="text-xs text-zinc-500 mt-1">PNG or JPG (Max 2MB)</p>
                                        {/* Placeholder only - actual upload logic requires Storage bucket setup */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations Tab */}
                    {activeTab === "integrations" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                                <CloudLightning className="w-5 h-5 text-amber-500" />
                                Integrations
                            </h2>
                            <p className="text-sm text-zinc-500">Connect your accounts to view real data in the Analytics Dashboard.</p>
                            
                            {/* Google Trends (System) */}
                            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg> 
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white">Google Trends</h3>
                                        <p className="text-xs text-green-600 font-medium">● System Connected (SerpApi)</p>
                                    </div>
                                </div>
                                <button type="button" disabled className="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-400 rounded-lg">Active</button>
                            </div>

                            {/* Instagram */}
                            <div className="space-y-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Instagram Graph API</h3>
                                    <span className="text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500">Optional</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Access Token</label>
                                    <input {...register('ig_token')} type="password" placeholder="IG_..." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-all font-mono text-sm" />
                                </div>
                                <details className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
                                    <summary>How to get this?</summary>
                                    <div className="pt-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 mt-1 space-y-1">
                                        <p>1. Go to <a href="https://developers.facebook.com/" target="_blank" className="underline text-blue-500">Meta for Developers</a>.</p>
                                        <p>2. Create an App (Type: Business).</p>
                                        <p>3. Add "Instagram Graph API" product.</p>
                                        <p>4. Generate User Access Token via Graph Explorer.</p>
                                    </div>
                                </details>
                            </div>

                            {/* Twitter / X */}
                            <div className="space-y-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Twitter / X API</h3>
                                    <span className="text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500">Optional</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Bearer Token</label>
                                    <input {...register('x_token')} type="password" placeholder="AAAA..." className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-all font-mono text-sm" />
                                </div>
                                <details className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
                                    <summary>How to get this?</summary>
                                    <div className="pt-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 mt-1 space-y-1">
                                        <p>1. Go to <a href="https://developer.x.com/" target="_blank" className="underline text-blue-500">X Developer Portal</a>.</p>
                                        <p>2. Create a Project & App.</p>
                                        <p>3. Copy the "Bearer Token" (v2).</p>
                                    </div>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
