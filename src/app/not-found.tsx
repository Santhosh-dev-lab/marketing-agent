"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
// Dynamic import for Lottie to ensure client-side only if needed, 
// though standard import usually works with 'use client'
import Lottie from "lottie-react";

export default function NotFound() {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch('/page-not-found.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load animation");
                return res.json();
            })
            .then(data => setAnimationData(data))
            .catch(err => console.log("Missing /page-not-found.json in public folder"));
    }, []);

    return (
        <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            
            {/* Background Effects - Prominent Grid */}
            <div className="absolute inset-0 bg-[#ffffff] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_-200px,#e5e7eb,transparent)] opacity-40 pointer-events-none" />

            {/* Animation Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl aspect-video flex items-center justify-center relative z-10"
            >
                {animationData ? (
                    <Lottie animationData={animationData} loop={true} className="w-full h-full drop-shadow-2xl" />
                ) : (
                    // Fallback
                    <div className="w-64 h-64 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                        <span className="text-4xl font-bold text-zinc-300">404</span>
                    </div>
                )}
            </motion.div>

            {/* Back Button - Dark on Light */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4 relative z-10"
            >
                <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-base font-medium shadow-xl hover:scale-105 hover:bg-black hover:shadow-2xl transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </motion.div>

        </div>
    );
}
