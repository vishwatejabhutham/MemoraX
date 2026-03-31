import { motion } from "framer-motion";

import weddingBg from "@/assets/wedding-bg.avif";
import concertCrowd from "@/assets/concert-crowd.jpg";
import weddingDecor from "@/assets/wedding-decor.avif";
import concertStage from "@/assets/concert-stage.jpg";

// TODO: GET /api/recent-events — Load dynamic data from database
const recentEvents = [
  { id: 1, title: "Grand Wedding in Hyderabad", category: "Weddings", image: weddingBg, guests: 500, savings: "₹45,000" },
  { id: 2, title: "Rock Concert in Bangalore", category: "Concerts", image: concertStage, guests: 2000, savings: "₹1,20,000" },
  { id: 3, title: "Birthday Bash in Mumbai", category: "Birthday Parties", image: weddingDecor, guests: 100, savings: "₹15,000" },
  { id: 4, title: "Corporate Summit in Delhi", category: "Corporate Events", image: concertCrowd, guests: 300, savings: "₹80,000" },
  { id: 5, title: "Engagement Ceremony in Chennai", category: "Weddings", image: weddingBg, guests: 200, savings: "₹30,000" },
  { id: 6, title: "Music Festival in Goa", category: "Concerts", image: concertStage, guests: 5000, savings: "₹2,50,000" },
];

export default function RecentEventsSection() {
  return (
    <div className="flex-1 px-6 md:px-12 py-10 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-glow mb-2">
          Memories We <span className="text-primary">Created</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm">Events planned and executed by MemoraX</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {recentEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary font-body text-xs">
                {event.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg text-foreground mb-2">{event.title}</h3>
              <div className="flex items-center justify-between text-muted-foreground font-body text-xs">
                <span>{event.guests} guests</span>
                <span className="text-accent">Saved {event.savings}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
