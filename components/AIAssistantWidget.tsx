"use client";

import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { askAssistant } from "@/lib/api/assistant";
import type { AssistantMessage } from "@/types";

const starterPrompts = ["Merhaba nasılsın?", "Adın ne?", "Instagram adresin ne?", "Hello, how are you?"];

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ai" | "local">("local");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      content:
        "Merhaba, ben BorAI. Günlük sohbet, tüm dillerde basit konuşmalar, matematik, fizik, yazılım, piyasa ve hava durumu dahil aklına gelen her konuda soru sorabilirsin."
    }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleMessages = useMemo(() => messages.slice(-8), [messages]);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await askAssistant(nextMessages);
      setMode(response.mode);
      setMessages([...nextMessages, { role: "assistant", content: response.answer }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "BorAI su anda cevap veremedi. Biraz sonra tekrar dene."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="glass-card flex h-[34rem] w-[calc(100vw-2rem)] max-w-md flex-col shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-mint/30 bg-mint/10 text-mint">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-white">BorAI</p>
                <p className="text-xs text-slate-400">{mode === "ai" ? "Genel AI modu" : "Yerel akilli mod"}</p>
              </div>
            </div>
            <button className="rounded-lg border border-line bg-white/5 p-2 text-slate-300 transition hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Asistani kapat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[82%] rounded-lg bg-mint px-4 py-3 text-sm font-semibold text-slate-950"
                      : "max-w-[88%] rounded-lg border border-line bg-white/5 px-4 py-3 text-sm leading-6 text-slate-100"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-mint" />
                  Cevap araniyor...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-line p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-mint/40 hover:text-white"
                  onClick={() => void sendQuestion(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="premium-input min-w-0 flex-1"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Bir sey sor..."
              />
              <button className="premium-button grid h-10 w-10 place-items-center px-0" type="submit" aria-label="Soruyu gonder">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          className="group flex items-center gap-3 rounded-full border border-mint/30 bg-slate-950/85 px-5 py-4 text-sm font-black text-white shadow-[0_0_45px_rgba(94,234,212,0.25)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-mint/60"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-slate-950">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">BorAI</span>
          <MessageCircle className="h-4 w-4 text-mint transition group-hover:scale-110" />
        </button>
      )}
    </div>
  );
}
