"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    PenTool, Image as ImageIcon, Calendar as CalendarIcon,
    Sparkles, Layout, Instagram, Twitter, Linkedin, Facebook,
    Loader2, MoreHorizontal, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContentStudioPage() {
    const [activeTab, setActiveTab] = useState<"create" | "calendar" | "assets">("create");
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentGeneratedContent, setCurrentGeneratedContent] = useState<string | null>(null);

    // Data State
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    // Inputs
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState("instagram");

    // Fetch Posts
    useEffect(() => {
        const fetchPosts = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoadingPosts(false);
                return;
            }

            // Get first brand for now (Simplified)
            // In real app, we should have a BrandSelector or context
            const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).limit(1).single();
            if (!brand) {
                setIsLoadingPosts(false);
                return;
            }

            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('brand_id', brand.id)
                .order('scheduled_at', { ascending: true });

            if (!error) {
                setPosts(data || []);
            } else {
                console.error("Error fetching posts:", error);
            }
            setIsLoadingPosts(false);
        };
        if (activeTab === "calendar") { // Only fetch when calendar tab is active
            fetchPosts();
        }
    }, [activeTab]); // Refetch when tab changes

    const generateContent = async (type: string) => {
        if (!topic) return;
        setIsGenerating(true);
        setCurrentGeneratedContent(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in first.");
                setIsGenerating(false);
                return;
            }

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('generate-content', {
                body: {
                    topic,
                    type,
                    platform,
                }
            });

            if (error) {
                console.error("Function Error details:", error);

                // Try to parse detailed error from context if available
                let msg = error.message || "Generation failed";
                if (error instanceof Error && 'context' in error) {
                    // @ts-ignore
                    const body = await error.context?.json().catch(() => null);
                    if (body && body.error) msg = body.error;
                }

                throw new Error(msg);
            }

            setCurrentGeneratedContent(data.content);

        } catch (e: any) {
            console.error(e);
            alert("Failed to generate: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSavePost = async (status: 'draft' | 'scheduled', date?: string) => {
        if (!currentGeneratedContent) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in to save posts.");
            return;
        }

        const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).limit(1).single();
        if (!brand) {
            alert("No brand profile found. Please create one first.");
            return;
        }

        const scheduledAt = status === 'scheduled' && date
            ? new Date(date).toISOString()
            : null;

        const { error } = await supabase.from('posts').insert({
            brand_id: brand.id,
            user_id: user.id,
            content: currentGeneratedContent,
            topic: topic,
            platform: platform,
            status: status,
            scheduled_at: scheduledAt,
        });

        if (error) {
            alert("Failed to save post: " + error.message);
            console.error(error);
        } else {
            alert(status === 'scheduled' ? "Post Scheduled!" : "Draft Saved!");
            setCurrentGeneratedContent(null);
            setTopic("");
            setActiveTab('calendar'); // Switch to calendar to see the new post
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Layout className="w-8 h-8 text-purple-600" />
                        Content Studio
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Create, plan, and publish content across all your channels.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    {(["create", "calendar", "assets"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "create" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {/* Tools Grid */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Creation Tools</h2>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-white/10">
                                <h3 className="font-bold text-lg mb-4">What do you want to create?</h3>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. A funny caption for our new summer dress collection launch..."
                                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-4 mb-4 outline-none focus:ring-2 ring-purple-500/50 min-h-[100px]"
                                />

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {['instagram', 'twitter', 'linkedin', 'facebook'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatform(p)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium border ${platform === p ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-500/30 dark:text-purple-300' : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid gap-3">
                                    <button
                                        onClick={() => generateContent('social media caption')}
                                        disabled={!topic || isGenerating}
                                        className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group text-left disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <PenTool className="w-5 h-5 text-purple-600" />
                                            <span className="font-bold text-purple-900 dark:text-purple-200">Generate Caption</span>
                                        </div>
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                                    </button>

                                    <button
                                        onClick={() => generateContent('list of post ideas')}
                                        disabled={!topic || isGenerating}
                                        className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group text-left disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Layout className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-blue-900 dark:text-blue-200">Brainstorm Post Ideas</span>
                                        </div>
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Workspace / Preview */}
                        <div className="bg-zinc-50 dark:bg-black/30 rounded-3xl border border-zinc-200 dark:border-white/10 p-8 min-h-[500px]">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Workspace</h2>

                            {isGenerating ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <p>Crafting magic...</p>
                                </div>
                            ) : currentGeneratedContent ? (
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                        <div className="text-sm font-bold">Your Brand</div>
                                        <div className="ml-auto text-xs text-zinc-400 uppercase font-bold">{platform}</div>
                                    </div>
                                    <textarea
                                        value={currentGeneratedContent}
                                        onChange={(e) => setCurrentGeneratedContent(e.target.value)}
                                        className="w-full bg-transparent border-none resize-none outline-none text-zinc-800 dark:text-zinc-200 leading-relaxed min-h-[120px]"
                                    />
                                    <div className="mt-4 flex gap-2 border-t border-zinc-100 dark:border-white/5 pt-4 justify-end">
                                        <button className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-3 py-1" onClick={() => setCurrentGeneratedContent(null)}>Discard</button>
                                        <button
                                            onClick={() => handleSavePost('draft')}
                                            className="text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-lg"
                                        >
                                            Save Draft
                                        </button>
                                        <button
                                            onClick={() => {
                                                const date = prompt("Enter Schedule Date (YYYY-MM-DD HH:MM)", new Date(Date.now() + 86400000).toISOString().slice(0, 16));
                                                if (date) handleSavePost('scheduled', date);
                                            }}
                                            className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg"
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center max-w-sm mx-auto">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Select a tool from the left to start creating content.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "calendar" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Scheduled Posts</h2>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold"
                            >
                                <Plus className="w-4 h-4" />
                                Schedule Post
                            </button>
                        </div>

                        {isLoadingPosts ? (
                            <div className="text-center p-10 text-zinc-500">Loading schedule...</div>
                        ) : (
                            <div className="grid gap-4">
                                {posts.length === 0 ? (
                                    <div className="text-center p-10 border border-dashed rounded-xl text-zinc-500">
                                        No upcoming posts. Go create some!
                                    </div>
                                ) : posts.map(post => (
                                    <div key={post.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg 
                                                ${post.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                                                    post.platform === 'twitter' ? 'bg-blue-100 text-blue-600' :
                                                        post.platform === 'linkedin' ? 'bg-blue-800/10 text-blue-700' :
                                                            post.platform === 'facebook' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-100 text-zinc-600'}`}>
                                                {post.platform === 'instagram' && <Instagram className="w-5 h-5" />}
                                                {post.platform === 'twitter' && <Twitter className="w-5 h-5" />}
                                                {post.platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                                                {post.platform === 'facebook' && <Facebook className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm truncate max-w-[200px]">{post.topic || "Social Post"}</h4>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : "Unscheduled"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase
                                                ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                                                    post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                                {post.status}
                                            </span>
                                            <div className="text-xs text-zinc-400 max-w-[300px] truncate hidden md:block">
                                                {post.content}
                                            </div>
                                            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg">
                                                <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "assets" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 text-zinc-500"
                    >
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Asset Library</h3>
                        <p>Your generated images and uploads will appear here.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
