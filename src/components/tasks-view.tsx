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
        const pageCount = doc.internal.getNumberOfPages();
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
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`group p-5 rounded-2xl border transition-all ${task.status === 'done'
                                    ? "bg-zinc-50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 opacity-60"
                                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`font-semibold text-lg ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                                                {task.title}
                                            </h3>
                                            <PriorityBadge p={task.priority} />
                                        </div>
                                        <p className="text-sm text-zinc-500 max-w-2xl">
                                            {task.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(task.created_at), 'MMM d, yyyy')}
                                            </span>
                                            {task.assignee_email && (
                                                <span className="flex items-center gap-1 text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                                                    <Mail className="w-3 h-3" />
                                                    {task.assignee_email}
                                                </span>
                                            )}
                                            {task.source_url && (
                                                <a
                                                    href={task.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    {new URL(task.source_url).hostname}
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {task.status !== 'done' && (
                                            <button
                                                onClick={() => handleAssignEmail(task.id)}
                                                className="p-2 text-zinc-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                title="Assign to Email"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                            </button>
                                        )}

                                        <select
                                            value={task.status}
                                            onChange={(e) => updateStatus(task.id, e.target.value)}
                                            className="bg-transparent text-sm font-medium text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 focus:border-zinc-400 outline-none"
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
