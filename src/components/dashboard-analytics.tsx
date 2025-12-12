"use client";

import { useMemo, useState, useEffect } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
    ArrowUp, ArrowDown, Users, Eye, MousePointerClick, 
    Share2, Instagram, Twitter, Linkedin, Globe, Search, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PLATFORM_DATA = [
    { name: "Instagram", value: 45, color: "#E1306C" },
    { name: "Twitter", value: 25, color: "#1DA1F2" },
    { name: "LinkedIn", value: 20, color: "#0A66C2" },
    { name: "Website", value: 10, color: "#10B981" },
];

export function DashboardAnalytics() {
    const [timeRange, setTimeRange] = useState("Month");
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [brandKeyword, setBrandKeyword] = useState<string>("Marketing"); // Default fallback

    // Fetch Brand Name to use as keyword
    useEffect(() => {
        const fetchBrand = async () => {
             const supabase = createClient();
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 const { data: brand } = await supabase.from('brands').select('name').eq('user_id', user.id).single();
                 if (brand?.name) setBrandKeyword(brand.name);
             }
        };
        fetchBrand();
    }, []);

    // Fetch Trends Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch from our new API route
                const res = await fetch(`/api/analytics/trends?keyword=${encodeURIComponent(brandKeyword)}`);
                const result = await res.json();
                
                if (result.data) {
                    setData(result.data);
                } else {
                    setData([]); // No data found, explicit empty state
                }
            } catch (err) {
                console.error("Failed to load trends", err);
                setData([]);
                if (err instanceof Error && err.message.includes("429")) {
                    setError("Usage limit reached. Please try again later.");
                } else {
                    setError("Failed to load analytics data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [brandKeyword, timeRange]);

    // Empty State Component
    const EmptyState = () => (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Data Available</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-2 mb-4">
                We couldn't find any trends data for "{brandKeyword}". Connect your social accounts to see real insights.
            </p>
            <a href="/dashboard/settings" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Connect Integrations
            </a>
        </div>
    );

    const StatsCard = ({ title, value, change, isPositive, icon: Icon, colorClass }: any) => (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {change}
                </span>
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                    {["All", "Today", "Week", "Month", "Year"].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                timeRange === t 
                                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                        + Create Data
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard 
                    title="Total Followers" 
                    value="2,132,435" 
                    change="6%" 
                    isPositive={true} 
                    icon={Users}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <StatsCard 
                    title="Total Reach" 
                    value="7,435" 
                    change="12%" 
                    isPositive={true} 
                    icon={Eye}
                    colorClass="bg-purple-500 text-purple-500"
                />
                <StatsCard 
                    title="Engagement" 
                    value="112,435" 
                    change="2%" 
                    isPositive={false} 
                    icon={MousePointerClick}
                    colorClass="bg-orange-500 text-orange-500"
                />
                <StatsCard 
                    title="Interactions" 
                    value="32,435" 
                    change="18%" 
                    isPositive={true} 
                    icon={Share2}
                    colorClass="bg-green-500 text-green-500"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Growth Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                Overview Analytics
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                            </h3>
                            <p className="text-sm text-zinc-500">
                                Interest over time for <span className="font-semibold text-zinc-900 dark:text-zinc-300">"{brandKeyword}"</span>
                            </p>
                        </div>
                        <select className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-sm px-3 py-1 outline-none">
                            <option>Followers</option>
                            <option>Reach</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                            </div>
                        ) : data.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33333320" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#F4F4F5' }}
                                    />
                                    <Bar dataKey="followers" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} barSize={32} />
                                    <Bar dataKey="reach" stackId="a" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Platform Breakdown */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Traffic by Platform</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                         {/* Donut Chart */}
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={PLATFORM_DATA}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {PLATFORM_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-zinc-900 dark:text-white">100%</span>
                                <span className="text-xs text-zinc-500">Traffic</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-3 mt-6">
                        {PLATFORM_DATA.map((p) => (
                            <div key={p.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                                </div>
                                <span className="font-semibold">{p.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* Bottom Grid: Content & Audience */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Content Performance */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Content Performance</h3>
                    <div className="space-y-6">
                        {[
                            { label: "Posts", val: 58, change: "+5%", color: "bg-blue-500" },
                            { label: "Replies", val: 234, change: "-5%", color: "bg-indigo-500" },
                            { label: "Likes", val: 2342, change: "+12%", color: "bg-purple-500" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                        {item.label}
                                    </span>
                                    <div className="flex gap-4">
                                        <span>{item.val}</span>
                                        <span className={item.change.startsWith("+") ? "text-green-500" : "text-red-500"}>{item.change}</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val > 200 ? 75 : 45}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audience Demographics */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Audience Geography</h3>
                    <div className="h-[200px] flex items-center justify-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="text-center space-y-2">
                            <Globe className="w-8 h-8 mx-auto opacity-50" />
                            <p>Map Visualization Loading...</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5">
                            <div className="text-xs text-zinc-500 mb-1">Top Country</div>
                            <div className="font-bold">🇺🇸 USA (45%)</div>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5">
                            <div className="text-xs text-zinc-500 mb-1">Top City</div>
                            <div className="font-bold">New York, NY</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
