"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import type { AiInsight } from "@/lib/types";
import { InsightCard } from "./InsightCard";

const QUICK_PROMPTS = [
  "Top alpha today?",
  "What's hot on Base?",
  "Explain smart money moves",
  "Best tokens to watch?",
];

interface ChatMessage {
  role: "user" | "ai";
  text?: string;
  insight?: AiInsight;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendPrompt(prompt: string) {
    if (!prompt.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", text: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as Partial<AiInsight>;
      const insight: AiInsight = {
        id: data.id ?? `ai-${Date.now()}`,
        summary: data.summary ?? "No insight available.",
        keyDrivers: data.keyDrivers ?? [],
        riskFactors: data.riskFactors ?? [],
        confidenceScore: data.confidenceScore ?? 0,
        timeHorizon: data.timeHorizon ?? "—",
        generatedAt: data.generatedAt ?? new Date().toISOString(),
      };
      setMessages((m) => [...m, { role: "ai", insight }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendPrompt(input);
  }

  return (
    <>
      {/* Floating toggle button — sits above TabBar */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-[76px] right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-[0.8125rem] font-semibold shadow-lg"
        style={{
          background: open
            ? "rgba(20,24,34,0.97)"
            : "linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)",
          border: open ? "1px solid #1C2538" : "none",
          boxShadow: open ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,82,255,0.45)",
        }}
      >
        <span>{open ? "✕" : "✦"}</span>
        <span>{open ? "Close" : "Ask Foresight"}</span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-[128px] left-0 right-0 max-w-[430px] mx-auto z-30 px-3"
          >
            <div
              className="rounded-2xl border border-ios-card-border overflow-hidden"
              style={{ background: "rgba(13,16,24,0.97)", backdropFilter: "blur(20px)" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-ios-separator">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ color: "#0052FF", background: "rgba(0,82,255,0.15)" }}
                  >
                    AI
                  </span>
                  <span className="text-[0.875rem] font-semibold text-ios-text">Ask Foresight</span>
                </div>
                <span className="text-[0.6875rem] text-ios-text-tertiary">Powered by Base AI</span>
              </div>

              {/* Quick prompts */}
              {messages.length === 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[0.6875rem] text-ios-text-tertiary mb-2.5">Quick prompts</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => sendPrompt(p)}
                        className="px-3 py-1.5 rounded-full bg-ios-bg-tertiary border border-ios-card-border text-[0.75rem] text-ios-text-secondary hover:text-ios-text hover:border-ios-blue/50 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message history */}
              {messages.length > 0 && (
                <div className="px-4 pt-3 pb-1 space-y-3 max-h-[280px] overflow-y-auto">
                  {messages.map((msg, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: chat history
                    <div key={i}>
                      {msg.role === "user" && (
                        <div className="flex justify-end">
                          <span className="inline-block px-3 py-2 rounded-2xl rounded-tr-sm bg-ios-blue text-white text-[0.8125rem] max-w-[80%]">
                            {msg.text}
                          </span>
                        </div>
                      )}
                      {msg.role === "ai" && msg.insight && <InsightCard insight={msg.insight} />}
                      {msg.role === "ai" && msg.text && (
                        <div className="flex justify-start">
                          <span className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm bg-ios-bg-tertiary text-ios-text-secondary text-[0.8125rem] max-w-[80%]">
                            {msg.text}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <div className="flex items-center gap-1.5 px-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-ios-blue"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.9,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about Base..."
                  disabled={loading}
                  className="flex-1 bg-ios-bg-tertiary border border-ios-card-border rounded-full px-4 py-2 text-[0.8125rem] text-ios-text placeholder:text-ios-text-tertiary outline-none focus:border-ios-blue/60 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13 1L1 7l5 2 2 5 5-13z" fill="white" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
