'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export function AICopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: "Hi! I'm your Finora Financial Assistant powered by GPT-4. Ask me anything about your cashflow, taxes, or financial strategy." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
            } else {
                const errorMessage = data.error || 'Unknown error';
                toast.error(`Error: ${errorMessage}`);
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: "Sorry, I encountered an error. Please try again."
                }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            toast.error("Network error. Please try again.");
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "Sorry, I'm having trouble connecting."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">

            {isOpen && (
                <Card className="w-96 h-[500px] mb-4 shadow-2xl shadow-black/50 border-white/10 bg-[#0c0c0e] animate-in slide-in-from-bottom-10 fade-in flex flex-col">
                    <CardHeader className="p-4 border-b border-white/5 flex flex-row justify-between items-center bg-gradient-to-r from-navy/40 to-secondary/20">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                                <div className="absolute inset-0 bg-secondary/20 blur-md rounded-full" />
                            </div>
                            <div>
                                <span className="font-bold text-white text-sm">Finora AI Copilot</span>
                                <p className="text-xs text-gray-400">Powered by GPT-4</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "p-3 rounded-lg text-sm max-w-[85%] leading-relaxed",
                                m.role === 'ai'
                                    ? "bg-gradient-to-br from-white/10 to-white/5 text-gray-200 self-start mr-auto rounded-tl-none border border-white/5"
                                    : "bg-gradient-to-br from-secondary/30 to-secondary/20 text-white self-end ml-auto rounded-tr-none border border-secondary/20"
                            )}>
                                {m.role === 'ai' && (
                                    <Sparkles className="w-3 h-3 inline mr-1 text-secondary" />
                                )}
                                {m.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="p-3 rounded-lg text-sm max-w-[85%] bg-white/10 text-gray-200 self-start mr-auto rounded-tl-none flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                                <span>Thinking...</span>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-3 border-t border-white/5 flex gap-2 bg-black/20">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            className="bg-black/20 border-white/10 h-10 text-sm focus:ring-secondary/50"
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <Button
                            size="icon"
                            className="h-10 w-10 bg-secondary hover:bg-secondary/90 text-white disabled:opacity-50"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-navy to-secondary hover:scale-110 transition-all shadow-xl shadow-secondary/30 border-2 border-white/10 p-0 relative group"
            >
                <MessageSquare className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
        </div>
    );
}
