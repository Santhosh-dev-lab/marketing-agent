"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => (
    <div className="mb-8">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wider px-4">
            {title}
        </h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

interface SidebarLinkProps {
    href: string;
    children: React.ReactNode;
}

const SidebarLink = ({ href, children }: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href={href}
            className={cn(
                "block w-full text-left px-4 py-1.5 text-sm transition-colors border-l-2",
                isActive 
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 font-medium bg-purple-50/50 dark:bg-purple-900/10" 
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
            )}
        >
            {children}
        </Link>
    );
};

export function DocumentationSidebar() {
    return (
        <nav className="h-full overflow-y-auto pb-10 scrollbar-hide py-6">
            <SidebarSection title="Platform Features">
                <SidebarLink href="/documentation/overview">Overview</SidebarLink>
                <SidebarLink href="/documentation/brand-intelligence">Brand Intelligence</SidebarLink>
                <SidebarLink href="/documentation/campaign-manager">Campaign Manager</SidebarLink>
                <SidebarLink href="/documentation/task-center">Task Center</SidebarLink>
                <SidebarLink href="/documentation/analytics">Analytics & Trends</SidebarLink>
            </SidebarSection>

            <SidebarSection title="Workflows">
                <SidebarLink href="/documentation/automated-execution">Automated Execution</SidebarLink>
                <SidebarLink href="/documentation/team-guidelines">Team Guidelines</SidebarLink>
            </SidebarSection>

            <SidebarSection title="Developers">
                <SidebarLink href="/documentation/api-reference">API Reference</SidebarLink>
            </SidebarSection>
        </nav>
    );
}
