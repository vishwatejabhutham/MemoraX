import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface RequestSectionProps {
  onExecute: () => void;
  hasSelectedCategory: boolean;
}

export default function RequestSection({ onExecute, hasSelectedCategory }: RequestSectionProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-glow mb-4">
          Ready to <span className="text-primary">Execute</span>?
        </h2>
        <p className="text-muted-foreground font-body text-sm md:text-base mb-8">
          Once you've finalized your plan with our AI, hit the button below.
          We'll contact vendors, negotiate prices, and finalize everything for you.
        </p>

        {/* TODO: POST /api/execute-event — Integrate Salesforce Flow here */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onExecute}
          disabled={!hasSelectedCategory}
          className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-display text-xl
                     neon-glow-gold-intense hover:neon-glow-gold transition-all duration-300 cursor-pointer
                     flex items-center gap-3 mx-auto disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6" />
          Execute My Event
        </motion.button>

        {!hasSelectedCategory && (
          <p className="mt-4 text-muted-foreground/60 font-body text-xs">
            Select a category and chat with AI first to create your plan
          </p>
        )}

        {/* Execution flow preview */}
        <div className="mt-12 space-y-4">
          {["Contacting vendors…", "Negotiating prices…", "Finalizing your plan…"].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-3 text-muted-foreground/50 font-body text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-primary/30" />
              {step}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
