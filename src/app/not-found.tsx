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
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
            
            {/* Animation Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md aspect-square mb-8 flex items-center justify-center"
            >
                {animationData ? (
                    <Lottie animationData={animationData} loop={true} className="w-full h-full" />
                ) : (
                    // Fallback if JSON is missing or loading
                    <div className="w-64 h-64 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-zinc-300 dark:text-zinc-700">404</span>
                    </div>
                )}
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-md space-y-6"
            >
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Page Not Found</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Oops! It seems you've ventured off the map. This page doesn't exist anymore.
                    </p>
                </div>

                <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </motion.div>

        </div>
    );
}
