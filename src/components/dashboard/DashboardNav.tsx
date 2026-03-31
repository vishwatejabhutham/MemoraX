import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "home", label: "Home" },
  { id: "chat", label: "Chat with AI" },
  { id: "voice", label: "Voice AI" },
  { id: "request", label: "Request" },
  { id: "recent", label: "Recent Events" },
  { id: "support", label: "Support" },
];

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
}

export default function DashboardNav({ activeTab, onTabChange, userName }: DashboardNavProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border/30">
      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-display text-xl md:text-2xl text-foreground shrink-0"
      >
        Memora<span className="text-primary">X</span>
      </motion.h1>

      {/* Pill Nav */}
      <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full px-1.5 py-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-2 rounded-full font-body text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile nav */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="bg-muted text-foreground font-body text-sm rounded-lg px-3 py-2 border border-border"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 shrink-0">
        {userName && (
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary font-display text-sm">{userName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-full glass-panel border border-border text-muted-foreground
                     font-body text-xs hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
