"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Menu, X } from "lucide-react";
import { DocumentationSidebar } from "@/components/documentation-sidebar";

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white font-sans">
      
      {/* --- HEADER --- */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-600 hidden sm:block">
                Documentation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      
      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-12 relative min-h-[calc(100vh-4rem)]">

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10 fixed" />

        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
             <DocumentationSidebar />
        </aside>

        {/* Sidebar (Mobile Overlay) */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 shadow-xl p-6">
                    <DocumentationSidebar />
                </div>
            </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-20">
            {children}
        </main>

      </div>
    </div>
  );
}
