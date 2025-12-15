"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, animate } from "framer-motion";
import { useState, useEffect, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { Brain, Zap, Globe, ArrowRight, Sparkles, Command, Cpu, MousePointer2, Rocket, ArrowLeft } from "lucide-react";

// --- ANIMATION PATH ---
const ANIMATION_PATH = "/about-animation.json";

// --- COMPONENTS ---

// 1. DYNAMIC WARP BACKGROUND (With Speed Control)
function WarpBackground({ speedMultiplier = 1 }: { speedMultiplier?: number }) {
    // Generate static stars once to avoid hydration mismatch
    const [stars, setStars] = useState<{ top: number; left: number; delay: number; duration: number }[]>([]);

    useEffect(() => {
        const generatedStars = [...Array(50)].map(() => ({
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 2 + Math.random() * 3
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="fixed inset-0 z-0 bg-[#020005] overflow-hidden pointer-events-none perspective-1000">
            {/* Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a103c] via-[#020005] to-black" />

            {/* Stars */}
            {stars.map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{ top: `${star.top}%`, left: `${star.left}%` }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        z: [0, 500] // Move towards camera
                    }}
                    transition={{
                        duration: star.duration / speedMultiplier, // Accelerate with prop
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Dynamic Warp Lines (Visible only at high speed) */}
            <motion.div
                className="absolute inset-0 opacity-0"
                animate={{ opacity: speedMultiplier > 2 ? 0.3 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] rounded-full border-[100px] border-indigo-500/10 blur-[100px]" />
            </motion.div>
        </div>
    );
}

// 2. HERO: THE GROWTH SINGULARITY
function HeroSection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch(ANIMATION_PATH).then(res => res.json()).then(setAnimationData).catch(() => { });
    }, []);

    function handleMouseMove({ clientX, clientY, currentTarget }: MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    }

    // Smooth 3D tilt with higher damping for "smoothness"
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 30 });

    return (
        <section
            onMouseMove={handleMouseMove}
            className="relative min-h-[90vh] flex flex-col justify-center items-center perspective-1000 overflow-hidden py-20"
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center transform-style-3d"
            >
                {/* Slogan Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-8"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono tracking-[0.2em] uppercase backdrop-blur-md">
                        Beyond Automation
                    </span>
                    <span className="mx-3 text-zinc-600">•</span>
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono tracking-[0.2em] uppercase backdrop-blur-md">
                        Pure Cognition
                    </span>
                </motion.div>

                {/* Heading */}
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 relative z-0 leading-[0.9]">
                    <span className="block text-white mix-blend-overlay">The Cognitive</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">
                        Architecture.
                    </span>
                </h1>

                {/* Savage Caption */}
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium">
                    Your competitors are still scheduling meetings. <br />
                    <span className="text-indigo-400">We are already conquering the market.</span>
                </p>

                {/* 3D Laptop */}
                {/* Holographic Projection */}
                {/* Holographic Projection */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative w-full max-w-4xl flex items-center justify-center mt-0 pb-20"
                >
                    {/* The Projection */}
                    <div className="relative w-full flex items-center justify-center z-10">
                        {animationData && (
                            <Lottie
                                animationData={animationData}
                                loop
                                className="w-full h-auto object-contain"
                            />
                        )}
                    </div>

                    {/* Hologram Base Emitter */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-indigo-500 shadow-[0_0_100px_rgba(79,70,229,0.5)] z-0" />
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-indigo-500/10 blur-[50px] rounded-[100%] pointer-events-none" />
                </motion.div>
            </motion.div>
        </section>
    );
}

// 3. SMOOTH TIMELINE
const FEATURES = [
    { title: "Neuro-Semantic Core", desc: "Understanding subtext, irony, and brand voice.", icon: Brain },
    { title: "Real-Time Velocity", desc: "Reacting to market trends in milliseconds.", icon: Zap },
    { title: "Global Orchestra", desc: "Unified messaging across all major platforms.", icon: Globe },
    { title: "Generative Engine", desc: "Creating visuals and copy on the fly.", icon: Sparkles },
    { title: "Deep Analytics", desc: "Predictive ROI modeling before launch.", icon: Command }
];

function TimelineSection() {
    return (
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-40">
            {/* Center Line */}
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent -translate-x-1/2 opacity-30" />

            {FEATURES.map((feature, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`relative flex items-center gap-2 md:gap-10 mb-12 md:mb-32 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                    {/* Content Side (Left for even, Right for odd via reverse) */}
                    <div className={`w-1/2 ${i % 2 === 0 ? 'text-right pr-4 md:pr-20' : 'text-left pl-4 md:pl-20'}`}>
                        <div className="group">
                            <h3 className="text-sm md:text-3xl font-bold text-white mb-1 md:mb-3 group-hover:text-indigo-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-[10px] md:text-xl text-zinc-400 leading-relaxed font-light">
                                {feature.desc}
                            </p>
                        </div>
                    </div>

                    {/* Central Node */}
                    <div className="relative z-10 flex-shrink-0">
                        {/* Glow */}
                        <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-[10px] md:blur-[20px] opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Circle */}
                        <div className="relative w-8 h-8 md:w-16 md:h-16 rounded-full bg-black border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                        </div>
                    </div>

                    {/* Spacer Side (Occupies other 50% to center the node) */}
                    <div className="w-1/2" />
                </motion.div>
            ))}
        </div>
    );
}

// 4. "QUANTUM CORE" FOOTER (RESPONSIVE & SOPHISTICATED)
function WarpFooter({ setSpeed }: { setSpeed: (s: number) => void }) {
    return (
        <div className="relative min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-20">

            {/* Quantum Core Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
                    {/* The Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] md:w-[200px] md:h-[200px] bg-indigo-600 rounded-full blur-[50px] md:blur-[80px] opacity-50" />

                    {/* Orbital Ring 1 */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-indigo-500/20 rounded-full border-dashed"
                    />

                    {/* Orbital Ring 2 (Tilted) */}
                    <motion.div
                        animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[40px] md:inset-[80px] border border-purple-500/20 rounded-full"
                    />

                    {/* Orbital Ring 3 (Inner) */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[80px] md:inset-[160px] border-t border-b border-white/10 rounded-full"
                    />

                    {/* Particles */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-1 h-1 md:w-2 md:h-2 bg-white rounded-full blur-[1px]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/3 right-1/4 w-2 h-2 md:w-3 md:h-3 bg-indigo-400 rounded-full blur-[2px]"
                    />
                </div>
            </div>

            <div className="relative z-10 text-center px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight"
                >
                    Ready to <span className="text-indigo-400">scale?</span>
                </motion.h2>

                <p className="text-lg md:text-xl text-zinc-400 mb-12 font-medium max-w-xs md:max-w-lg mx-auto">
                    Simple pricing. Infinite potential. No credit card required.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setSpeed(50)}
                    onHoverEnd={() => setSpeed(1)}
                    className="group relative px-10 py-4 md:px-12 md:py-5 bg-white text-black rounded-full font-bold text-base md:text-lg hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3 mx-auto"
                >
                    <span className="relative z-10">Start for free</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>
        </div>
    );
}

export default function AboutPage() {
    const [speed, setSpeed] = useState(1);
    const [backStars, setBackStars] = useState<{ width: string; top: string; delay: number; repeatDelay: number }[]>([]);
    const router = useRouter();

    useEffect(() => {
        setBackStars([...Array(5)].map(() => ({
            width: Math.random() * 20 + 10 + "px",
            top: Math.random() * 100 + "%",
            delay: Math.random() * 0.5,
            repeatDelay: Math.random() * 0.2
        })));
    }, []);

    return (
        <div className="min-h-screen bg-[#020005] font-sans text-white selection:bg-indigo-500/30 overflow-x-hidden">
            <WarpBackground speedMultiplier={speed} />

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={() => router.back()}
                className="fixed top-8 left-8 md:top-12 md:left-12 z-50 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full overflow-hidden group hover:border-white/30 transition-colors"
            >
                {/* Warp Animation Container */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Moving Stars/Lines */}
                    {backStars.map((star, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hover: { x: ["100%", "-100%"] }
                            }}
                            transition={{
                                duration: 0.6,
                                ease: "linear",
                                repeat: Infinity,
                                delay: i * 0.1, // Stagger based on index
                                repeatDelay: star.repeatDelay
                            }}
                            className="absolute top-1/2 h-[1px] bg-indigo-400/80 shadow-[0_0_5px_rgba(129,140,248,1)] rounded-full"
                            style={{
                                width: star.width,
                                top: star.top,
                                right: "-20%" // Start off-screen right
                            }}
                        />
                    ))}
                </div>

                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white relative z-10 group-hover:-translate-x-1 transition-all duration-300" />
            </motion.button>

            <HeroSection />
            <TimelineSection />
            <WarpFooter setSpeed={setSpeed} />
        </div>
    );
}

