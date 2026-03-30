import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Music, Heart, Cake, Briefcase, Sparkles } from "lucide-react";

import weddingBg from "@/assets/wedding-bg.avif";
import concertCrowd from "@/assets/concert-crowd.jpg";
import weddingDecor from "@/assets/wedding-decor.avif";
import concertStage from "@/assets/concert-stage.jpg";

const categories = [
  { id: "concerts", label: "Concerts", icon: Music, image: concertStage, color: "from-purple-500/30 to-purple-900/60" },
  { id: "weddings", label: "Weddings", icon: Heart, image: weddingBg, color: "from-pink-500/30 to-pink-900/60" },
  { id: "birthday", label: "Birthday Parties", icon: Cake, image: weddingDecor, color: "from-amber-500/30 to-amber-900/60" },
  { id: "corporate", label: "Corporate Events", icon: Briefcase, image: concertCrowd, color: "from-cyan-500/30 to-cyan-900/60" },
  { id: "other", label: "Other", icon: Sparkles, image: weddingBg, color: "from-emerald-500/30 to-emerald-900/60" },
];

// TODO: Replace with real event data API
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) navigate("/auth");
        else {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCategorySelect = (categoryId: string) => {
    navigate(`/plan/${categoryId}`);
  };

  const activeBg = hoveredCategory
    ? categories.find(c => c.id === hoveredCategory)?.image
    : null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dynamic background based on hovered category */}
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          className="absolute inset-0 z-0"
          initial={false}
          animate={{ opacity: hoveredCategory === cat.id ? 0.25 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={cat.image} alt="" className="w-full h-full object-cover" />
        </motion.div>
      ))}
      <div className="absolute inset-0 z-[1] bg-background/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-5">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-2xl text-foreground"
          >
            Memora<span className="text-primary">X</span>
          </motion.h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-muted-foreground font-body text-sm hidden md:inline">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg glass-panel border border-border text-muted-foreground
                         font-body text-xs hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Hero heading */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground text-glow leading-tight">
              What memory do you want<br />to <span className="text-primary">create</span>?
            </h2>
            <p className="text-muted-foreground font-body mt-4 text-sm md:text-base max-w-lg mx-auto">
              Choose a category and let our AI craft the perfect event for you.
            </p>
          </motion.div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-5xl w-full">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 40, rotateX: 15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.08,
                    rotateY: 5,
                    rotateX: -3,
                    y: -8,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="relative group rounded-2xl overflow-hidden cursor-pointer border border-border
                             hover:border-primary/40 transition-colors duration-300"
                  style={{ perspective: "600px", transformStyle: "preserve-3d" }}
                >
                  {/* Card image bg */}
                  <div className="absolute inset-0">
                    <img src={cat.image} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color}`} />
                    <div className="absolute inset-0 bg-background/50 group-hover:bg-background/30 transition-colors duration-300" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center py-10 md:py-14 px-4">
                    <motion.div
                      className="p-3 rounded-xl glass-panel border border-border/50 mb-3
                                 group-hover:neon-glow-gold transition-shadow duration-500"
                    >
                      <Icon className="w-7 h-7 text-primary" />
                    </motion.div>
                    <p className="font-display text-base md:text-lg text-foreground">{cat.label}</p>
                  </div>

                  {/* Hover glow edge */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                  shadow-[inset_0_0_30px_hsla(var(--neon-gold)/0.15)]" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
