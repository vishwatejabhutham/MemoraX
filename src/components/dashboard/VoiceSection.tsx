import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useState } from "react";

export default function VoiceSection() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-glow mb-3">
          Speak with <span className="text-primary">Memora AI</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm md:text-base max-w-md mx-auto">
          Tap the mic to get instant answers about your event planning
        </p>
      </motion.div>

      {/* Mic Button with animated rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        {/* Animated rings */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 140, height: 140, top: -10, left: -10 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              style={{ width: 140, height: 140, top: -10, left: -10 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/10"
              animate={{ scale: [1, 2.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              style={{ width: 140, height: 140, top: -10, left: -10 }}
            />
          </>
        )}

        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-[120px] h-[120px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-500
            ${isListening
              ? "bg-primary/20 border-2 border-primary neon-glow-gold-intense"
              : "glass-panel border-2 border-border hover:border-primary/40 hover:neon-glow-gold"
            }`}
        >
          <Mic className={`w-10 h-10 transition-colors duration-300 ${isListening ? "text-primary" : "text-muted-foreground"}`} />
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-muted-foreground font-body text-sm"
      >
        {isListening ? "Listening... speak now" : "Tap 🎙️ to start speaking"}
      </motion.p>

      {/* TODO: Integrate speech-to-text API */}
      <p className="mt-4 text-muted-foreground/40 font-body text-xs">
        Supports English, Hindi, and 30+ more languages
      </p>
    </div>
  );
}
