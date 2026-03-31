import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function VoiceSection() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Canvas orb animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = 90;

      // Get audio data if available
      let audioData = new Uint8Array(128).fill(128);
      if (analyserRef.current && isListening) {
        audioData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(audioData);
      }

      const avgLevel = isListening
        ? audioData.reduce((a, b) => a + b, 0) / audioData.length / 255
        : 0;

      // Outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius * 1.6);
      glowGrad.addColorStop(0, `hsla(170, 70%, 50%, ${0.08 + avgLevel * 0.15})`);
      glowGrad.addColorStop(0.5, `hsla(200, 80%, 50%, ${0.04 + avgLevel * 0.08})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // Orb ring
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(170, 70%, 50%, ${0.4 + avgLevel * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner gradient orb
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
      innerGrad.addColorStop(0, `hsla(200, 80%, 40%, ${0.15 + avgLevel * 0.2})`);
      innerGrad.addColorStop(0.7, `hsla(220, 60%, 20%, ${0.1 + avgLevel * 0.1})`);
      innerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius - 2, 0, Math.PI * 2);
      ctx.fill();

      // Waveform particles inside orb
      const particleCount = 60;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
        const audioIndex = Math.floor((i / particleCount) * audioData.length);
        const audioVal = isListening ? audioData[audioIndex] / 255 : 0.2 + Math.sin(time + i * 0.3) * 0.1;
        const waveR = baseRadius * 0.3 + audioVal * baseRadius * 0.5;
        const x = cx + Math.cos(angle) * waveR;
        const y = cy + Math.sin(angle) * waveR;
        const pSize = 1.5 + audioVal * 2;

        const hue = 170 + (i / particleCount) * 160;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.4 + audioVal * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Second layer waveform
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2 - time * 0.3;
        const audioIndex = Math.floor((i / 40) * audioData.length);
        const audioVal = isListening ? audioData[audioIndex] / 255 : 0.15 + Math.cos(time * 0.7 + i * 0.5) * 0.1;
        const waveR = baseRadius * 0.5 + audioVal * baseRadius * 0.3;
        const x = cx + Math.cos(angle) * waveR;
        const y = cy + Math.sin(angle) * waveR;

        ctx.fillStyle = `hsla(330, 80%, 60%, ${0.2 + audioVal * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + audioVal * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 0.02;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening]);

  const startListening = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: "ai", text: "Speech recognition is not supported in your browser. Please try Chrome." }]);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch {
      // Audio visualization won't work but STT can still proceed
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript(final);
        handleSendMessage(final);
      } else {
        setTranscript(interim);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      analyserRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setTranscript("");
    setIsProcessing(true);
    setAiTyping(true);

    try {
      const aiMessages = [
        { role: "system", content: "You are Memora AI, a friendly event planning assistant. Keep responses concise (2-3 sentences). Help users plan events." },
        ...messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        { role: "user", content: text.trim() },
      ];

      const res = await supabase.functions.invoke("event-chat", {
        body: { messages: aiMessages, phase: "chat", category: "general" },
      });

      const aiText = res.data?.response || "I'm here to help with your event planning! What would you like to know?";
      setMessages(prev => [...prev, { role: "ai", text: aiText }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsProcessing(false);
      setAiTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-8 py-6 overflow-hidden">
      {/* Left: Conversation History */}
      <div className="lg:w-72 shrink-0 space-y-3">
        <h3 className="font-display text-lg text-foreground mb-4">Conversation</h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-xs font-body">
                Start speaking to see your conversation here...
              </motion.p>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl px-3 py-2.5 text-xs font-body ${
                  msg.role === "user"
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "bg-accent/10 border border-accent/20 text-foreground"
                }`}
              >
                <span className={`text-[10px] font-semibold block mb-1 ${msg.role === "user" ? "text-primary" : "text-accent"}`}>
                  {msg.role === "user" ? "You" : "Memora AI"}
                </span>
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Center: Orb */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative cursor-pointer"
          onClick={isListening ? stopListening : startListening}
        >
          <canvas
            ref={canvasRef}
            className="w-[280px] h-[280px]"
            style={{ imageRendering: "auto" }}
          />

          {/* Center mic icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isListening ? (
              <MicOff className="w-8 h-8 text-accent/60" />
            ) : (
              <Mic className="w-8 h-8 text-muted-foreground/40" />
            )}
          </div>
        </motion.div>

        {/* Live transcript */}
        {transcript && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-foreground/70 font-body text-sm max-w-md text-center italic"
          >
            "{transcript}"
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-muted-foreground font-body text-base font-medium"
        >
          {isListening ? "Listening..." : aiTyping ? "Thinking..." : "Tap the orb to speak"}
        </motion.p>

        <p className="mt-2 text-muted-foreground/40 font-body text-xs">
          Powered by Web Speech API · English &amp; 30+ languages
        </p>
      </div>

      {/* Right: AI Response Panel */}
      <div className="lg:w-72 shrink-0">
        <h3 className="font-display text-lg text-foreground mb-4">AI Response</h3>
        <div className="space-y-3">
          {messages.filter(m => m.role === "ai").length === 0 ? (
            <p className="text-muted-foreground text-xs font-body">
              Memora AI responses will appear here...
            </p>
          ) : (
            <AnimatePresence>
              {messages.filter(m => m.role === "ai").slice(-3).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-xl p-3 border border-accent/20"
                >
                  <p className="text-foreground text-xs font-body leading-relaxed">{msg.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {aiTyping && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="glass-panel rounded-xl p-3 border border-accent/20"
            >
              <p className="text-accent text-xs font-body">Memora AI is thinking...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
