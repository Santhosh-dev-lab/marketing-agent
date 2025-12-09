export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-6">
                <div className="text-xl font-bold text-purple-400">MA Dashboard</div>
                <nav className="flex flex-col gap-2 text-zinc-400">
                    <div className="p-2 rounded bg-white/5 text-white">Overview</div>
                    <div className="p-2 rounded hover:bg-white/5 transition-colors">Campaigns</div>
                    <div className="p-2 rounded hover:bg-white/5 transition-colors">Brand Assets</div>
                    <div className="p-2 rounded hover:bg-white/5 transition-colors">Settings</div>
                </nav>
            </aside>

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200">
                        + New Campaign
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Campaigns", value: "3" },
                        { label: "Scheduled Posts", value: "12" },
                        { label: "Engagement Rate", value: "+24%" },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-zinc-400 text-sm mb-1">{stat.label}</div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-12 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                    Placeholder: Recent Activity Chart
                </div>
            </main>
        </div>
    );
}
