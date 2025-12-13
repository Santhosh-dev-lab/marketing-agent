"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layout, Server, Database, Cpu, Share2, Globe, Sparkles } from "lucide-react";

// --- CONFIGURATION ---
const NODE_W = 140; 
const NODE_H = 70;
const HALF_W = NODE_W / 2;
const HALF_H = NODE_H / 2;

// Exact centers for the SVG
const POSITIONS = {
  client: { x: 100, y: 250 },
  edge:   { x: 320, y: 250 },
  agent:  { x: 580, y: 250 },
  llm:    { x: 850, y: 120 },
  db:     { x: 850, y: 380 },
  social: { x: 920, y: 250 }, // Positioned strictly to the right
};

export function ArchitectureDiagram() {
  return (
    <div className="w-full relative flex items-center justify-center py-12 select-none">
      
      {/* Scalable Container */}
      <div className="w-full max-w-[1000px]">
        <svg 
            viewBox="0 0 1000 500" 
            className="w-full h-auto overflow-visible"
            style={{ minHeight: "300px" }}
        >
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" className="text-zinc-600">
                    <path d="M0,0 L6,3 L0,6 L1,3 Z" fill="currentColor" />
                </marker>
                <marker id="arrowhead-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" className="text-purple-500">
                    <path d="M0,0 L6,3 L0,6 L1,3 Z" fill="currentColor" />
                </marker>
                <marker id="arrowhead-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" className="text-amber-500">
                    <path d="M0,0 L6,3 L0,6 L1,3 Z" fill="currentColor" />
                </marker>
                
                {/* Gradient Definition */}
                <linearGradient id="cloud-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>

            {/* --- CONNECTIONS LAYER --- */}
            {/* 1. Client -> Edge */}
            <FlowPath 
                start={{ x: POSITIONS.client.x + HALF_W, y: POSITIONS.client.y }} 
                end={{ x: POSITIONS.edge.x - HALF_W, y: POSITIONS.edge.y }} 
                label="Request" 
            />

            {/* 2. Edge -> Agent */}
            <FlowPath 
                start={{ x: POSITIONS.edge.x + HALF_W, y: POSITIONS.edge.y }} 
                end={{ x: POSITIONS.agent.x - HALF_W, y: POSITIONS.agent.y }} 
                label="Orchestrate" 
                color="text-amber-500" 
                marker="arrowhead-amber" 
                dashed={false} 
            />

            {/* 3a. Agent -> LLM (Curved Up) */}
            <FlowPath 
                start={{ x: POSITIONS.agent.x + HALF_W, y: POSITIONS.agent.y }} 
                end={{ x: POSITIONS.llm.x - HALF_W, y: POSITIONS.llm.y }} 
                control={[ POSITIONS.agent.x + 100, POSITIONS.agent.y, POSITIONS.llm.x - 100, POSITIONS.llm.y ]}
                label="Context" 
            />

            {/* 3b. Agent -> DB (Curved Down) */}
            <FlowPath 
                start={{ x: POSITIONS.agent.x + HALF_W, y: POSITIONS.agent.y }} 
                end={{ x: POSITIONS.db.x - HALF_W, y: POSITIONS.db.y }} 
                control={[ POSITIONS.agent.x + 100, POSITIONS.agent.y, POSITIONS.db.x - 100, POSITIONS.db.y ]}
                label="Store" 
            />

            {/* 4. Agent -> Socials (Crossing) */}
            {/* To avoid clutter, let's imply the 'Result' flows coming FROM the Agent to a final output */}
            <FlowPath 
                start={{ x: POSITIONS.agent.x + HALF_W, y: POSITIONS.agent.y }} 
                end={{ x: POSITIONS.social.x, y: POSITIONS.social.y - 40 }} // Connecting to top of socials? No, standard 
                // Let's go WIDE to avoid the middle nodes
                control={[ 
                    POSITIONS.agent.x + 100, POSITIONS.agent.y - 80, 
                    POSITIONS.social.x - 50, POSITIONS.social.y - 80 
                ]}
                endPointOverride={{ x: POSITIONS.social.x, y: POSITIONS.social.y - 40 }} // Top attachment
                label="Publish" 
                color="text-purple-500" 
                marker="arrowhead-purple" 
            />

            {/* --- NODES LAYER (ForeignObject) --- */}
            {/* By using foreignObject with precise x/y minus half width/height, we guarantee centering */}
            
            <DiagramNode pos={POSITIONS.client} icon={Layout} label="Client" sub="Next.js App" type="source" />
            <DiagramNode pos={POSITIONS.edge} icon={Globe} label="Edge API" sub="Supabase" />
            <DiagramNode pos={POSITIONS.agent} icon={Sparkles} label="Magic Agent" sub="Orchestrator" type="agent" />
            <DiagramNode pos={POSITIONS.llm} icon={Cpu} label="Gemini Pro" sub="Reasoning" />
            <DiagramNode pos={POSITIONS.db} icon={Database} label="Database" sub="Memory" />
            <DiagramNode pos={POSITIONS.social} icon={Share2} label="Socials" sub="Network APIs" type="sink" />

        </svg>
      </div>
    </div>
  );
}

// --- Sub-components ---

function DiagramNode({ pos, icon: Icon, label, sub, type = "default" }: any) {
    const colors = {
        source: "border-zinc-700 bg-zinc-950/80 text-zinc-300",
        sink: "border-pink-500/30 bg-pink-900/10 text-pink-400 shadow-[0_0_20px_-10px_rgba(236,72,153,0.3)]",
        agent: "border-amber-500/50 bg-amber-900/10 text-amber-400 shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]",
        default: "border-zinc-800 bg-zinc-950/80 text-zinc-400"
    };
    
    const styleLine = type === 'default' ? colors.default : (type === 'source' ? colors.source : (type === 'sink' ? colors.sink : colors.agent));

    return (
        <foreignObject 
            x={pos.x - HALF_W} 
            y={pos.y - HALF_H} 
            width={NODE_W} 
            height={NODE_H}
            className="overflow-visible"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`w-full h-full flex flex-col items-center justify-center rounded-xl border backdrop-blur-sm ${styleLine}`}
            >
                <div className={`flex items-center gap-2 mb-1 ${type === 'agent' ? 'text-amber-100' : ''}`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-xs">{label}</span>
                </div>
                <span className="text-[10px] opacity-60 uppercase tracking-widest font-mono">{sub}</span>
            </motion.div>
        </foreignObject>
    )
}

function FlowPath({ start, end, control, label, color = "text-zinc-600", dashed = true, marker = "arrowhead", endPointOverride }: any) {
    const sx = start.x;
    const sy = start.y;
    // Use override if provided (for connecting to top/bottom of nodes)
    const ex = endPointOverride ? endPointOverride.x : end.x;
    const ey = endPointOverride ? endPointOverride.y : end.y;
    
    let pathD = "";
    if (control && control.length === 4) {
         pathD = `M ${sx} ${sy} C ${control[0]} ${control[1]}, ${control[2]} ${control[3]}, ${ex} ${ey}`;
    } else {
        pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
    }

    // Label positioning
    const t = 0.5;
    let labelX = (sx + ex) / 2;
    let labelY = (sy + ey) / 2;

    if (control && control.length === 4) {
        const [p1x, p1y, p2x, p2y] = control;
        labelX = Math.pow(1-t,3)*sx + 3*Math.pow(1-t,2)*t*p1x + 3*(1-t)*Math.pow(t,2)*p2x + Math.pow(t,3)*ex;
        labelY = Math.pow(1-t,3)*sy + 3*Math.pow(1-t,2)*t*p1y + 3*(1-t)*Math.pow(t,2)*p2y + Math.pow(t,3)*ey;
    }

    return (
        <g className={`${color}`}>
            <path 
                d={pathD} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeDasharray={dashed ? "6 6" : "none"}
                className="opacity-60"
                markerEnd={`url(#${marker})`}
            >
                {dashed && (
                    <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite" />
                )}
            </path>

            {label && (
                 <foreignObject x={labelX - 40} y={labelY - 12} width="80" height="24" className="overflow-visible pointer-events-none">
                    <div className="flex justify-center items-center h-full">
                        <span className="bg-[#0A0A0A] text-[10px] text-zinc-500 border border-zinc-900 rounded-full px-2 py-0.5 whitespace-nowrap shadow-sm">
                            {label}
                        </span>
                    </div>
                </foreignObject>
            )}
        </g>
    )
}
