import { motion } from "framer-motion";

interface HeroOverlayProps {
  onExplore: () => void;
  visible: boolean;
}

// TODO: Replace with real event data API
export default function HeroOverlay({ onExplore, visible }: HeroOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="font-display text-4xl sm:text-5xl md:text-7xl text-center text-foreground text-glow leading-tight max-w-4xl px-6"
      >
        Turn Moments Into
        <br />
        <span className="text-primary">Unforgettable Memories</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
        className="mt-6 text-base sm:text-lg md:text-xl text-center text-muted-foreground text-glow-subtle max-w-lg px-6 font-body leading-relaxed"
      >
        Concerts. Weddings. Parties.
        <br />
        Designed and executed by AI.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
        className="mt-12 pointer-events-auto"
      >
        <button
          onClick={onExplore}
          className="group relative px-10 py-4 rounded-xl font-body text-lg font-medium text-foreground
                     glass-panel neon-glow-gold animate-float
                     border border-primary/30
                     transition-all duration-500 cursor-pointer
                     hover:neon-glow-gold-intense hover:border-primary/60 hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span className="relative z-10">Explore MemoraX</span>
          {/* Glow backdrop */}
          <div className="absolute inset-0 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
        </button>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-8 text-sm text-muted-foreground/50 font-body"
      >
        MemoraX — Your AI Memory Engine
      </motion.p>
    </div>
  );
}
