"use client";

import { Users, Lock, FileText } from "lucide-react";

export default function TeamGuidelinesPage() {
    return (
        <div className="space-y-12">
            <div>
                 <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Team Guidelines
                    </h1>
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    Collaborating with AI is a team sport. Establish clear roles and approval workflows to maintain quality control.
                </p>
            </div>

            <hr className="border-zinc-200 dark:border-white/10" />

            <div className="grid md:grid-cols-2 gap-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-zinc-500" />
                        Roles & Permissions
                    </h2>
                    <ul className="space-y-4">
                        <li className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
                            <span className="font-bold text-purple-600 block">Admin</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Full access. Can change Brand Intelligence settings and connect/disconnect social accounts.</span>
                        </li>
                        <li className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
                            <span className="font-bold text-blue-600 block">Editor</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Can create campaigns and edit content. Cannot publish without approval (optional).</span>
                        </li>
                        <li className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
                            <span className="font-bold text-zinc-500 block">Viewer</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Read-only access to Analytics and Calendar.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-500" />
                        Best Practices
                    </h2>
                    <div className="prose dark:prose-invert text-zinc-600 dark:text-zinc-400 text-sm">
                        <ul className="space-y-2">
                            <li><strong>Review First:</strong> Always review AI-generated "Fact checks" before publishing.</li>
                            <li><strong>Iterate on Voice:</strong> If the agent sounds "off", update the Brand Profile text samples rather than editing every single post. The agent learns from the context you provide.</li>
                            <li><strong>Tags:</strong> Use consistent campaign tags (e.g., "Q4-Launch") to make analytics useful later.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
