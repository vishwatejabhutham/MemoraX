import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import DashboardNav from "@/components/dashboard/DashboardNav";
import HomeSection from "@/components/dashboard/HomeSection";
import VoiceSection from "@/components/dashboard/VoiceSection";
import RequestSection from "@/components/dashboard/RequestSection";
import RecentEventsSection from "@/components/dashboard/RecentEventsSection";
import SupportSection from "@/components/dashboard/SupportSection";

// TODO: Replace with real event data API
// TODO: Load dynamic scenes from database
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/plan/${categoryId}`);
  };

  const handleExecute = () => {
    if (selectedCategory) {
      navigate(`/plan/${selectedCategory}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={user?.name}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {activeTab === "home" && <HomeSection onCategorySelect={handleCategorySelect} />}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <h2 className="font-display text-3xl md:text-4xl text-foreground text-glow mb-4">
                Chat with <span className="text-primary">Memora AI</span>
              </h2>
              <p className="text-muted-foreground font-body text-sm mb-8 text-center max-w-md">
                Select a category from Home first, then our AI will guide you through the planning process.
              </p>
              <button
                onClick={() => setActiveTab("home")}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm cursor-pointer hover:opacity-90 transition-opacity"
              >
                Choose a Category
              </button>
            </div>
          )}
          {activeTab === "voice" && <VoiceSection />}
          {activeTab === "request" && <RequestSection onExecute={handleExecute} hasSelectedCategory={!!selectedCategory} />}
          {activeTab === "recent" && <RecentEventsSection />}
          {activeTab === "support" && <SupportSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
