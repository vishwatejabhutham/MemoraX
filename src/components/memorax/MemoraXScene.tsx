import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SceneEnvironment from "./SceneEnvironment";
import HeroOverlay from "./HeroOverlay";

// TODO: Integrate AI planning backend
export default function MemoraXScene() {
  const [exploring, setExploring] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleExplore = useCallback(() => {
    setExploring(true);
    // After camera zoom completes, show dashboard
    setTimeout(() => setShowDashboard(true), 2000);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 1, 8], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <SceneEnvironment cameraZ={exploring ? -2 : 8} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />

      {/* Hero Overlay */}
      <HeroOverlay onExplore={handleExplore} visible={!exploring} />

      {/* Dashboard transition */}
      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center"
            >
              <h2 className="font-display text-3xl md:text-5xl text-foreground text-glow mb-4">
                Welcome to <span className="text-primary">MemoraX</span>
              </h2>
              <p className="text-muted-foreground font-body text-lg mb-8">
                Your AI-powered event planning dashboard is loading...
              </p>
              {/* TODO: Replace with real event data API */}
              <div className="flex gap-4 justify-center flex-wrap px-6">
                {["Weddings", "Concerts", "Parties"].map((type, i) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.2, duration: 0.6 }}
                    className="glass-panel rounded-xl px-8 py-6 neon-glow-gold border border-primary/20"
                  >
                    <p className="text-primary font-display text-xl">{type}</p>
                    <p className="text-muted-foreground font-body text-sm mt-1">AI-Planned</p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => { setShowDashboard(false); setExploring(false); }}
                className="mt-10 px-6 py-3 rounded-lg glass-panel border border-border text-muted-foreground
                           font-body text-sm hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
              >
                ← Back to Experience
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
