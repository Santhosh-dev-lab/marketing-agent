"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your Marketing Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare context
            const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));
            conversationHistory.push({ role: "user", content: userMessage });

            // Call Edge Function with streaming
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-assistant`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ messages: conversationHistory }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status} ${errorText}`);
            }
            if (!response.body) throw new Error("No response body");

            // Create a placeholder for the AI response
            let aiResponse = "";
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                // Parse OpenAI stream format "data: {...}"
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    if (line.includes("[DONE]")) continue;
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content || "";
                            aiResponse += content;

                            // Update the last message with new content
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1].content = aiResponse;
                                return newMessages;
                            });
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Chat Error:", error);
            let errorMessage = "Sorry, I encountered an error. Please try again later.";

            if (error instanceof Error) {
                // Try to parse JSON error from server
                try {
                    // Check if error message looks like "Server Error: 500 {"error":...}"
                    const match = error.message.match(/Server Error: \d+ (.+)/);
                    if (match) {
                        const jsonError = JSON.parse(match[1]);
                        // OpenAI error structure
                        if (jsonError.error?.message) { // "Incorrect API Key..."
                            errorMessage = jsonError.error.message;
                        }
                        // Our backend error structure
                        else if (jsonError.error) {
                            // Handle nested OpenAI error string if parsed
                            if (typeof jsonError.error === 'string' && jsonError.error.startsWith("OpenAI API Error:")) {
                                errorMessage = jsonError.error;
                            } else {
                                errorMessage = jsonError.error;
                            }
                        }
                    } else {
                        errorMessage = error.message;
                    }
                } catch (e) {
                    errorMessage = error.message;
                }
            }

            setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl w-[90vw] md:w-[400px] h-[500px] mb-4 pointer-events-auto flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Marketing Assistant</h3>
                                    <span className="flex items-center gap-1 text-xs text-green-500">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                        ? "bg-purple-600 text-white"
                                        : "bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
                                        }`}>
                                        {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-purple-600 text-white rounded-tr-sm"
                                        : "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-zinc-400 text-xs ml-12">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AI is typing...
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about marketing or the website..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${isOpen
                    ? "bg-zinc-800 text-white rotate-90"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}
