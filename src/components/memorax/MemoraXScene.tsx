import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HeroOverlay from "./HeroOverlay";

import weddingBg from "@/assets/wedding-bg.avif";
import concertCrowd from "@/assets/concert-crowd.jpg";
import weddingDecor from "@/assets/wedding-decor.avif";
import concertStage from "@/assets/concert-stage.jpg";
import memoBg from "@/assets/memorax-bg.mp4";

// TODO: Integrate AI planning backend
export default function MemoraXScene() {
  const navigate = useNavigate();
  const [exploring, setExploring] = useState(false);

  const handleExplore = useCallback(() => {
    setExploring(true);
    setTimeout(() => navigate("/auth"), 1500);
  }, [navigate]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background image collage */}
      <div className="absolute inset-0">
        {/* Left: Wedding */}
        <motion.div
          className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: exploring ? 0 : 1 }}
          transition={{ duration: 1.5 }}
        >
          <img src={weddingBg} alt="" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        </motion.div>

        {/* Right: Concert crowd */}
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: exploring ? 0 : 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <img src={concertCrowd} alt="" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        </motion.div>

        {/* Bottom left: Wedding decor */}
        <motion.div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: exploring ? 0 : 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        >
          <img src={weddingDecor} alt="" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background/60" />
        </motion.div>

        {/* Bottom right: Concert stage */}
        <motion.div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: exploring ? 0 : 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          <img src={concertStage} alt="" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background/60" />
        </motion.div>

        {/* Center vignette overlay to blend all images */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" 
             style={{ background: 'radial-gradient(ellipse at center, hsl(var(--background) / 0.7) 0%, hsl(var(--background) / 0.3) 50%, hsl(var(--background) / 0.8) 100%)' }} />
      </div>

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />

      {/* Hero Overlay */}
      <HeroOverlay onExplore={handleExplore} visible={!exploring} />

      {/* Fade to black on explore */}
      <AnimatePresence>
        {exploring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-30 bg-background"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
