import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// TODO: Replace with real event data API
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl md:text-5xl text-foreground text-glow mb-4">
          Welcome to <span className="text-primary">MemoraX</span>
        </h2>
        {user && (
          <p className="text-muted-foreground font-body text-lg mb-8">
            Hello, {user.name}! Your AI-powered event planning dashboard.
          </p>
        )}
        {/* TODO: Integrate AI planning backend */}
        <div className="flex gap-4 justify-center flex-wrap mb-10">
          {["Weddings", "Concerts", "Parties"].map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
              className="glass-panel rounded-xl px-8 py-6 neon-glow-gold border border-primary/20"
            >
              <p className="text-primary font-display text-xl">{type}</p>
              <p className="text-muted-foreground font-body text-sm mt-1">AI-Planned</p>
            </motion.div>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-lg glass-panel border border-border text-muted-foreground
                     font-body text-sm hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
