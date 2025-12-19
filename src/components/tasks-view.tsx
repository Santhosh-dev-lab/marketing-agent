"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, MoreHorizontal, UserPlus, Mail, Globe, Download } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee_email?: string;
    due_date?: string;
    source_url?: string;
    created_at: string;
}

export function TasksView({ brandId, userId }: { brandId: string | null, userId: string | null }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Default false if no brand/user, set true if valid
    const [filter, setFilter] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

    // Create Task Form State
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("medium");

    const supabase = createClient();

    useEffect(() => {
        if ((!brandId || brandId === 'null') && (!userId)) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchTasks();

        // Realtime Subscription
        // Use brand_id filter if we have it, otherwise user_id (if schema supports strict user filter, but typically RLS handles it)
        // Note: For now, if no brandId, we might not get realtime updates unless we filter by user_id if column exists.
        // Assuming migration added user_id.
        let filterStr = `brand_id=eq.${brandId}`;
        if (!brandId && userId) {
            filterStr = `user_id=eq.${userId}`;
        }

        const channel = supabase
            .channel('realtime_tasks')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: filterStr
            }, (payload) => {
                const newTask = payload.new as Task;
                const oldTask = payload.old as Task;

                if (payload.eventType === 'INSERT') {
                    setTasks((current) => [newTask, ...current]);
                } else if (payload.eventType === 'DELETE') {
                    setTasks((current) => current.filter(t => t.id !== oldTask.id));
                } else if (payload.eventType === 'UPDATE') {
                    setTasks((current) => current.map(t => t.id === newTask.id ? newTask : t));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [brandId, userId]);

    async function fetchTasks() {
        if ((!brandId || brandId === 'null') && (!userId)) return;

        try {
            let query = supabase.from('tasks').select('*');

            if (brandId && brandId !== 'null') {
                query = query.eq('brand_id', brandId);
            } else if (userId) {
                // Fallback to user_id if brand is missing
                // This requires the 'user_id' column to exist (migration 20251217)
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    // PDF Export Function
    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Add Title and Brand Info
        doc.setFontSize(22);
        doc.setTextColor(24, 24, 27); // Zinc 900
        doc.text("Marketing Action Plan", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(113, 113, 122); // Zinc 500
        doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')} | status: ${filter.toUpperCase()}`, 14, 30);

        // Prepare Data
        const tableData = filteredTasks.map(t => [
            t.title,
            t.description || "No description provided.",
            t.status.replace('_', ' ').toUpperCase(),
            t.priority.toUpperCase(),
            format(new Date(t.created_at), 'MMM d')
        ]);

        // Generate Table
        autoTable(doc, {
            head: [['Action Item', 'Details / AI Recommendation', 'Status', 'Priority', 'Date']],
            body: tableData,
            startY: 40,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 4,
                lineColor: [228, 228, 231], // Zinc 200
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [24, 24, 27], // Zinc 900
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold' }, // Title
                1: { cellWidth: 'auto' }, // Description (Flexible)
                2: { cellWidth: 25 }, // Status
                3: { cellWidth: 20 }, // Priority
                4: { cellWidth: 20 }  // Date
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250] // Zinc 50
            }
        });

        // Footer
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(161, 161, 170);
            doc.text(`Page ${i} of ${pageCount} | Generated by AI Marketing Agent`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`marketing-plan-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    async function handleCreateTask(e: React.FormEvent) {
        e.preventDefault();
        try {
            const { data, error } = await supabase.from('tasks').insert({
                brand_id: brandId,
                title: newTaskTitle,
                description: newTaskDesc,
                priority: newTaskPriority,
                status: 'todo'
            }).select().single();

            if (error) throw error;
            setTasks([data, ...tasks]);
            setIsCreateModalOpen(false);
            setNewTaskTitle("");
            setNewTaskDesc("");
        } catch (e) {
            alert("Failed to create task");
            console.error(e);
        }
    }

    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    async function updateStatus(taskId: string, newStatus: string) {
        if (newStatus === 'done') {
            setTaskToDelete(taskId);
            return;
        }

        // Optimistic update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    }

    async function confirmDelete() {
        if (!taskToDelete) return;

        const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete);

        if (error) {
            alert("Failed to delete task");
        } else {
            setTasks(tasks.filter(t => t.id !== taskToDelete));
        }
        setTaskToDelete(null);
    }

    async function handleClearAll() {
        // Optimistic UI
        setTasks([]);
        setIsClearAllModalOpen(false);

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('brand_id', brandId);

        if (error) {
            alert("Failed to clear tasks");
            fetchTasks(); // Revert on failure
        }
    }

    async function handleAssignEmail(taskId: string) {
        const email = prompt("Enter email address to assign this task to:");
        if (!email) return;

        // In a real app, this would trigger an Edge Function to send an email via Resend
        // For now, we just save the field
        setTasks(tasks.map(t => t.id === taskId ? { ...t, assignee_email: email } : t));
        await supabase.from('tasks').update({ assignee_email: email }).eq('id', taskId);

        alert(`Task assigned to ${email}. (Email notification would be sent here)`);
    }

    const filteredTasks = tasks.filter(t => filter === "all" ? true : t.status === filter);

    const PriorityBadge = ({ p }: { p: string }) => {
        const colors: any = {
            low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            medium: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
            high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
            <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${colors[p] || colors.medium}`}>
                {p}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Action Items</h1>
                    <p className="text-zinc-500">Manage your marketing tasks and AI recommendations.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Export Button */}
                    <button
                        onClick={handleExportPDF}
                        disabled={tasks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>

                    {tasks.length > 0 && (
                        <button
                            onClick={() => setIsClearAllModalOpen(true)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors text-sm"
                        >
                            Clear All
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['all', 'todo', 'in_progress', 'done'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            }`}
                    >
                        {f === 'all' ? 'All Tasks' : f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="p-8 text-center text-zinc-500">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <p className="text-zinc-500">
                            No tasks found. Create one or run the <Link href="/dashboard/settings" className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 hover:opacity-80">Website Analyzer</Link> in Settings.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredTasks.map((task) => {
                            // Helper to parse content
                            const parseContent = (desc: string) => {
                                const sections = {
                                    insight: "",
                                    action: "",
                                    impact: ""
                                };

                                // Simple regex-like extraction (case insensitive)
                                const insightMatch = desc.match(/Insight:\s*([\s\S]*?)(?=(Action:|Impact:|$))/i);
                                const actionMatch = desc.match(/Action:\s*([\s\S]*?)(?=(Impact:|$))/i);
                                const impactMatch = desc.match(/Impact:\s*([\s\S]*?)(?=$)/i);

                                if (insightMatch) sections.insight = insightMatch[1].trim();
                                if (actionMatch) sections.action = actionMatch[1].trim();
                                if (impactMatch) sections.impact = impactMatch[1].trim();

                                if (!insightMatch && !actionMatch && !impactMatch) return null;
                                return sections;
                            };

                            const parsed = parseContent(task.description);

                            return (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-sm ${task.status === 'done'
                                        ? "bg-zinc-50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 opacity-70 grayscale-[0.5]"
                                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
                                        }`}
                                >
                                    {/* Priority Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.priority === 'critical' ? 'bg-gradient-to-b from-red-500 to-pink-600' :
                                        task.priority === 'high' ? 'bg-gradient-to-b from-orange-500 to-amber-500' :
                                            task.priority === 'medium' ? 'bg-gradient-to-b from-blue-500 to-cyan-500' :
                                                'bg-zinc-300 dark:bg-zinc-700'
                                        }`} />

                                    <div className="p-6 pl-8">
                                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <PriorityBadge p={task.priority} />
                                                    {task.source_url && (
                                                        <a
                                                            href={task.source_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-blue-600 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full transition-colors truncate max-w-[200px]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Globe className="w-3 h-3" />
                                                            {new URL(task.source_url).hostname}
                                                        </a>
                                                    )}
                                                </div>
                                                <h3 className={`text-xl font-bold leading-snug tracking-tight ${task.status === 'done' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                                                    }`}>
                                                    {task.title}
                                                </h3>
                                            </div>

                                            {/* Action Controls */}
                                            <div className="flex items-center gap-3 self-start shrink-0">
                                                {task.status !== 'done' && (
                                                    <button
                                                        onClick={() => handleAssignEmail(task.id)}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all shadow-sm hover:shadow"
                                                        title="Assign to teammate"
                                                    >
                                                        <UserPlus className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <div className="relative">
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => updateStatus(task.id, e.target.value)}
                                                        className={`h-10 pl-4 pr-10 rounded-xl text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all appearance-none border shadow-sm ${task.status === 'todo' ? 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800' :
                                                            task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' :
                                                                'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                                            }`}
                                                    >
                                                        <option value="todo">To Do</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="done">Done</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Structured Content */}
                                        <div className="space-y-4 mb-6">
                                            {parsed ? (
                                                <div className="grid gap-4">
                                                    {parsed.insight && (
                                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                            <h4 className="flex items-center gap-2 text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-3">
                                                                <Search className="w-4 h-4" /> Strategic Insight
                                                            </h4>
                                                            <p className="text-zinc-800 dark:text-zinc-300 text-[15px] leading-relaxed">
                                                                {parsed.insight}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {parsed.action && (
                                                            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/50 dark:from-purple-950/30 dark:to-fuchsia-950/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                                                                <h4 className="flex items-center gap-2 text-xs font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-3">
                                                                    <CheckCircle2 className="w-4 h-4" /> Recommended Action
                                                                </h4>
                                                                <p className="text-zinc-800 dark:text-zinc-300 text-[15px] leading-relaxed">
                                                                    {parsed.action}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {parsed.impact && (
                                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                                                <h4 className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3">
                                                                    <div className="w-4 h-4 rounded-full bg-emerald-700 dark:bg-emerald-400 text-white dark:text-emerald-950 flex items-center justify-center text-[10px] font-bold">!</div> Expected Impact
                                                                </h4>
                                                                <p className="text-zinc-800 dark:text-zinc-300 text-[15px] leading-relaxed">
                                                                    {parsed.impact}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                    <p className="text-zinc-700 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-line">
                                                        {task.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Info */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <Clock className="w-3.5 h-3.5" />
                                                Created {format(new Date(task.created_at), 'MMM d, yyyy')}
                                            </div>
                                            {task.assignee_email && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-900/30">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    Assigned to {task.assignee_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Clear All Confirmation Modal */}
            {isClearAllModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Clear All Tasks?</h2>
                                <p className="text-zinc-500 text-sm">
                                    You are about to delete <strong>{tasks.length} tasks</strong>.
                                    <br /><br />
                                    This action is <strong className="text-red-500">irreversible</strong>.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setIsClearAllModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Delete All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create New Task</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            {/* ... existing form inputs ... */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    required
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. Update Homepage Banner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={newTaskDesc}
                                    onChange={e => setNewTaskDesc(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                                    placeholder="Details..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select
                                    value={newTaskPriority}
                                    onChange={e => setNewTaskPriority(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-zinc-500 hover:text-zinc-900 font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {taskToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete this Task?</h2>
                                <p className="text-zinc-500 text-sm">
                                    You are marking <strong>"{tasks.find(t => t.id === taskToDelete)?.title}"</strong> as finished.
                                    <br /><br />
                                    This will <strong>permanently delete</strong> it from your task list. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setTaskToDelete(null)}
                                    className="flex-1 px-4 py-2 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Yes, Complete & Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
