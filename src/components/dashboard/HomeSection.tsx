import { motion } from "framer-motion";

const categories = [
  { id: "concerts", label: "Concerts", gradient: "from-purple-600/20 to-purple-900/40" },
  { id: "weddings", label: "Weddings", gradient: "from-pink-600/20 to-pink-900/40" },
  { id: "birthday", label: "Birthday Parties", gradient: "from-amber-600/20 to-amber-900/40" },
  { id: "corporate", label: "Corporate Events", gradient: "from-cyan-600/20 to-cyan-900/40" },
  { id: "other", label: "Other", gradient: "from-emerald-600/20 to-emerald-900/40" },
];

interface HomeSectionProps {
  onCategorySelect: (categoryId: string) => void;
}

export default function HomeSection({ onCategorySelect }: HomeSectionProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground text-glow leading-tight">
          What memory do you want<br />to <span className="text-primary">create</span>?
        </h2>
        <p className="text-muted-foreground font-body mt-4 text-sm md:text-base max-w-lg mx-auto">
          Choose a category and let our AI craft the perfect event for you.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 max-w-4xl w-full">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            whileHover={{ scale: 1.06, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCategorySelect(cat.id)}
            className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-border
                       hover:border-primary/50 transition-all duration-300 bg-gradient-to-b ${cat.gradient}`}
          >
            <div className="relative z-10 flex items-center justify-center py-10 md:py-14 px-4">
              <p className="font-display text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                {cat.label}
              </p>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                           shadow-[inset_0_0_30px_hsla(var(--neon-gold)/0.15)]" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
