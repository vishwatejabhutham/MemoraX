import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

const faqs = [
  { q: "How does MemoraX plan my event?", a: "Our AI analyzes your requirements, budget, and preferences to create a personalized event plan with vendor recommendations and timelines." },
  { q: "Is the pricing negotiated by AI?", a: "Yes! Our AI negotiates with vendors on your behalf to get the best possible prices, saving you time and money." },
  { q: "Can I modify my plan after generation?", a: "Absolutely! Chat with our AI to refine any aspect of your plan — add services, change vendors, or adjust budget allocations." },
  { q: "What event types do you support?", a: "We support Concerts, Weddings, Birthday Parties, Corporate Events, and custom events of any type." },
];

export default function SupportSection() {
  return (
    <div className="flex-1 px-6 md:px-12 py-10 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-glow mb-2">
          How can we <span className="text-primary">help</span>?
        </h2>
        <p className="text-muted-foreground font-body text-sm">Get in touch with our team</p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, label: "Live Chat", desc: "Chat with our support team" },
            { icon: Mail, label: "Email Us", desc: "support@memorax.ai" },
            { icon: Phone, label: "Call Us", desc: "+91 800-MEMORA-X" },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-xl border border-border hover:border-primary/40 p-6 text-center
                         transition-all duration-300 cursor-pointer group"
            >
              <item.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-3" />
              <h3 className="font-display text-foreground mb-1">{item.label}</h3>
              <p className="text-muted-foreground font-body text-xs">{item.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-panel rounded-xl border border-border p-4 group cursor-pointer"
              >
                <summary className="font-body text-sm text-foreground list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground font-body text-sm leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
