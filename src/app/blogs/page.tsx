"use client";

import { ArrowLeft, Search, Clock, ArrowRight, TrendingUp, Hash, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Post {
    id: string;
    title: string;
    category: string;
    read_time: string;
    created_at: string;
    excerpt: string;
    image_url: string;
    url?: string;
}

export default function BlogsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("All");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const categories = ["All", "SEO", "Content Strategy", "Social Media", "Analytics", "Automation", "AI Marketing"];

    const MOCK_POSTS: Post[] = [
        { id: '1', title: 'The AI Revolution: Marketing in 2025', category: 'AI Marketing', read_time: '6 min read', excerpt: 'AI is deepening its integration into marketing, moving beyond automation to hyper-personalization at scale.', image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000', created_at: new Date().toISOString(), url: 'https://wsi-dms.com/the-ai-marketing-revolution-why-2025-is-your-strategic-turning-point/' },
        { id: '2', title: 'SEO in 2025: Optimizing for Generative Engines', category: 'SEO', read_time: '8 min read', excerpt: 'Traditional SEO is evolving into Generative Engine Optimization (GEO). Learn how to optimize for AI search results.', image_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=1000', created_at: new Date(Date.now() - 86400000).toISOString(), url: 'https://backlinko.com/generative-engine-optimization-geo' },
        { id: '3', title: 'Social Media 2025: The Rise of Community', category: 'Social Media', read_time: '5 min read', excerpt: 'Brands are prioritizing employee-generated content and authentic storytelling over traditional influencers.', image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000', created_at: new Date(Date.now() - 172800000).toISOString(), url: 'https://medium.com/@clickonitsolution/social-media-in-2025-from-virality-to-community-building-a7653091d249' },
        { id: '4', title: 'The End of "Zero-Click" Searches?', category: 'SEO', read_time: '7 min read', excerpt: 'Explore strategies to maintain visibility in a post-traffic landscape where AI answers queries directly.', image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=1000', created_at: new Date(Date.now() - 259200000).toISOString(), url: 'https://www.wsiworld.com/blog/the-google-click-crisis-60-of-searches-now-end-without-a-visit' },
        { id: '5', title: 'Video Marketing Dominance', category: 'Content Strategy', read_time: '6 min read', excerpt: 'Short-form video remains king, but long-form is gaining traction for deeper engagement.', image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=1000', created_at: new Date(Date.now() - 345600000).toISOString(), url: 'https://webilum.eu/en/dominance-of-video-marketing-and-short-form-content/' },
        { id: '6', title: 'Data Privacy & Ethical AI', category: 'Analytics', read_time: '5 min read', excerpt: 'How to build trust while leveraging advanced targeting capabilities in a privacy-first world.', image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000', created_at: new Date(Date.now() - 432000000).toISOString(), url: 'https://www.ardentprivacy.ai/blog/data-privacy-and-ai-ethics/' },
    ];

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.log("Supabase error (using fallback data):", error.message);
                    setPosts(MOCK_POSTS);
                } else if (data && data.length > 0) {
                    // Validate URLs to prevent image redirects
                    const validatedData = data.map((post: any) => ({
                        ...post,
                        url: (post.url && !post.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? post.url : MOCK_POSTS.find(mp => mp.title === post.title)?.url || '#'
                    }));
                    setPosts(validatedData as Post[]);
                } else {
                    console.log("No data in Supabase (using fallback data)");
                    setPosts(MOCK_POSTS);
                }
            } catch (err: any) {
                console.error("Error fetching posts:", err);
                setPosts(MOCK_POSTS);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    // Filter posts based on active tab
    const filteredPosts = activeTab === "All"
        ? posts
        : posts.filter(post => post.category === activeTab);

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get Featured Post (First one)
    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
            {/* Grid Pattern Background */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header / Back Button */}
                <div className="mb-12 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm bg-white dark:bg-black"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Marketing Insights & Trends
                    </div>
                </div>

                {/* Featured Article */}
                {loading ? (
                    <div className="h-[400px] mb-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 animate-pulse border border-zinc-200 dark:border-white/5" />
                ) : featuredPost ? (
                    <div onClick={() => window.open(featuredPost.url || '#', '_blank')} className="group relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:shadow-2xl transition-all duration-500 cursor-pointer mb-16">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                            <div className="order-2 md:order-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold mb-6">
                                    <TrendingUp className="w-3 h-3" />
                                    Featured
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                                    {featuredPost.title}
                                </h1>
                                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed line-clamp-3">
                                    {featuredPost.excerpt}
                                </p>
                                <button className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="order-1 md:order-2 h-64 md:h-full min-h-[300px] rounded-2xl overflow-hidden border border-zinc-100 dark:border-white/5 relative">
                                {featuredPost.image_url && featuredPost.image_url.startsWith('http') ? (
                                    <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                                        <span className="text-purple-300 dark:text-purple-700 font-black text-8xl opacity-20">AI</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Filter & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 sticky top-4 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === cat
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md'
                                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        />
                    </div>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading marketing insights...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm font-bold text-zinc-900 dark:text-white underline hover:no-underline"
                        >
                            Try fetching again
                        </button>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 dark:text-zinc-400">No articles found for "{activeTab}".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <a
                                key={post.id}
                                href={post.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-purple-500/5 transition-all hover:-translate-y-1 cursor-pointer"
                            >
                                <div className="h-48 bg-zinc-100 dark:bg-white/5 relative overflow-hidden">
                                    {/* Use post image if available, otherwise generic gradient */}
                                    {post.image_url && post.image_url.startsWith('http') ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-black/90 backdrop-blur-md text-[10px] font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 uppercase tracking-wider">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time}</span>
                                        <span>•</span>
                                        <span>{formatDate(post.created_at)}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        Read Article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-20 text-center">
                    <button className="px-8 py-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-sm font-bold text-zinc-900 dark:text-white">
                        Load More Articles
                    </button>
                </div>
            </div>
        </div>
    );
}
