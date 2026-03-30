import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Mic, Loader2, Sparkles, Play } from "lucide-react";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  concerts: "Concert",
  weddings: "Wedding",
  birthday: "Birthday Party",
  corporate: "Corporate Event",
  other: "Event",
};

type Message = {
  role: "ai" | "user";
  content: string;
};

type PlanSection = {
  title: string;
  items: string[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-chat`;

// TODO: POST /api/execute-event
// Integrate Salesforce Flow here
const executionSteps = [
  { text: "Contacting vendors…", duration: 2000 },
  { text: "Negotiating prices…", duration: 2500 },
  { text: "Finalizing your plan…", duration: 2000 },
];

async function streamAIChat({
  messages,
  category,
  phase,
  onDelta,
  onDone,
}: {
  messages: { role: string; content: string }[];
  category: string;
  phase: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, category, phase }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "AI service error" }));
    throw new Error(err.error || "AI service error");
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

async function generatePlan(
  messages: { role: string; content: string }[],
  category: string
): Promise<{ sections: PlanSection[]; totalCost: string; savings: string }> {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, category, phase: "plan" }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "AI service error" }));
    throw new Error(err.error || "Failed to generate plan");
  }

  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content || "";
  // Extract JSON from the response (may be wrapped in markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse plan");
  return JSON.parse(jsonMatch[0]);
}

export default function PlanEvent() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"chat" | "plan" | "executing" | "final">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [plan, setPlan] = useState<PlanSection[]>([]);
  const [planMeta, setPlanMeta] = useState({ totalCost: "", savings: "" });
  const [executionStep, setExecutionStep] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  // Initial AI greeting via streaming
  useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(true);
      setIsStreaming(true);
      let fullText = "";

      streamAIChat({
        messages: [{ role: "user", content: `I want to plan a ${categoryLabels[category || ""] || "event"}. Start by greeting me and asking your first question.` }],
        category: category || "other",
        phase: "chat",
        onDelta: (chunk) => {
          fullText += chunk;
          setTyping(false);
          setMessages([{ role: "ai", content: fullText }]);
        },
        onDone: () => {
          setIsStreaming(false);
        },
      }).catch((err) => {
        setTyping(false);
        setIsStreaming(false);
        toast.error(err.message);
        setMessages([{ role: "ai", content: `Welcome to MemoraX! 🌟 I'll help you plan an amazing ${categoryLabels[category || ""] || "event"}. What is your budget for this event?` }]);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);

    // Build conversation history for AI
    const aiMessages = newMessages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    setTyping(true);
    setIsStreaming(true);
    let fullResponse = "";

    try {
      await streamAIChat({
        messages: aiMessages,
        category: category || "other",
        phase: "chat",
        onDelta: (chunk) => {
          fullResponse += chunk;
          setTyping(false);
          setMessages([...newMessages, { role: "ai", content: fullResponse }]);
        },
        onDone: () => {
          setIsStreaming(false);
          // Check if AI signals it has enough info
          if (fullResponse.includes("[READY_TO_PLAN]")) {
            const cleanMsg = fullResponse.replace("[READY_TO_PLAN]", "").trim();
            setMessages([...newMessages, { role: "ai", content: cleanMsg }]);
            // Generate plan
            setTimeout(async () => {
              setMessages((prev) => [
                ...prev,
                { role: "ai", content: "✨ Generating your personalized event plan..." },
              ]);
              try {
                const planData = await generatePlan(aiMessages, category || "other");
                setPlan(planData.sections);
                setPlanMeta({ totalCost: planData.totalCost, savings: planData.savings });
                setPhase("plan");
              } catch (err) {
                toast.error("Failed to generate plan. Please try again.");
                console.error(err);
              }
            }, 1000);
          }
        },
      });
    } catch (err: any) {
      setTyping(false);
      setIsStreaming(false);
      toast.error(err.message || "Failed to get AI response");
    }
  };

  const handleExecute = async () => {
    setPhase("executing");
    for (let i = 0; i < executionSteps.length; i++) {
      setExecutionStep(i);
      await new Promise((r) => setTimeout(r, executionSteps[i].duration));
    }
    setPhase("final");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 md:px-12 py-5 border-b border-border/50">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl text-foreground">
          Plan Your <span className="text-primary">{categoryLabels[category || ""] || "Event"}</span>
        </h1>
      </header>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Chat Phase */}
          {phase === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 font-body text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "glass-panel border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "ai" && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span className="text-primary text-xs font-medium">Memora AI</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {typing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="glass-panel border border-border rounded-2xl rounded-bl-sm px-5 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 md:px-8 pb-6">
                <div className="flex gap-3 items-end">
                  {/* TODO: Integrate speech-to-text API */}
                  <button className="p-3 rounded-xl glass-panel border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer shrink-0">
                    <Mic className="w-5 h-5" />
                  </button>
                  <div className="flex-1 flex items-end glass-panel rounded-xl border border-border focus-within:border-primary/40 transition-colors">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your answer..."
                      disabled={isStreaming}
                      className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                      className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground/30 transition-colors cursor-pointer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Plan Phase */}
          {phase === "plan" && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 px-4 md:px-8 py-8 space-y-6 overflow-y-auto">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl md:text-3xl text-foreground text-center text-glow">
                Your <span className="text-primary">{categoryLabels[category || ""]}</span> Plan
              </motion.h2>

              {plan.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="glass-panel rounded-xl border border-border p-6"
                >
                  <h3 className="font-display text-lg text-foreground mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="text-muted-foreground font-body text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="flex justify-center pt-4">
                <button
                  onClick={handleExecute}
                  className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg neon-glow-gold-intense hover:scale-105 transition-transform duration-300 cursor-pointer flex items-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Execute My Event
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Executing Phase */}
          {phase === "executing" && (
            <motion.div key="executing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={executionStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-display text-xl md:text-2xl text-foreground text-glow text-center"
                >
                  {executionSteps[executionStep]?.text}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Final Phase */}
          {phase === "final" && (
            <motion.div key="final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 px-4 md:px-8 py-8 space-y-6 overflow-y-auto">
              <div className="text-center">
                <motion.h2 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-display text-2xl md:text-4xl text-foreground text-glow mb-2">
                  🎉 Event Finalized!
                </motion.h2>
                <p className="text-muted-foreground font-body text-sm">Your event plan is ready.</p>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-xl border border-primary/30 neon-glow-gold p-6">
                <h3 className="font-display text-lg text-foreground mb-4">Final Cost Summary</h3>
                {plan
                  .find((s) => s.title.includes("Budget"))
                  ?.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground font-body text-sm">{item.split(":")[0]}</span>
                      <span className="text-foreground font-body text-sm font-medium">{item.split(":")[1]}</span>
                    </div>
                  ))}
                <div className="flex justify-between pt-4 mt-2 border-t border-primary/30">
                  <span className="text-foreground font-display">Total</span>
                  <span className="text-primary font-display text-lg">{planMeta.totalCost}</span>
                </div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-4 text-sm font-body text-accent">
                  ✨ You saved {planMeta.savings} using AI negotiation!
                </motion.p>
              </motion.div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 rounded-xl glass-panel border border-border text-muted-foreground font-body text-sm hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
