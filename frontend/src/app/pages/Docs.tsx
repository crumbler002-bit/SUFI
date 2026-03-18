import { motion } from "motion/react";
import { Book, Code, Zap, Shield, Globe, Smartphone } from "lucide-react";
import { BentoCard } from "../components/BentoCard";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";

export function Docs() {
  const sections = [
    { icon: <Zap className="w-6 h-6" />, title: "Quick Start", description: "Get started with SUFI in minutes", color: "from-[#F97316] to-[#ea6a0f]" },
    { icon: <Code className="w-6 h-6" />, title: "API Reference", description: "Complete API documentation", color: "from-[#6366F1] to-[#5558e3]" },
    { icon: <Shield className="w-6 h-6" />, title: "Authentication", description: "Secure your integration", color: "from-[#10B981] to-[#059669]" },
    { icon: <Globe className="w-6 h-6" />, title: "Webhooks", description: "Real-time event notifications", color: "from-[#8B5CF6] to-[#7C3AED]" },
    { icon: <Smartphone className="w-6 h-6" />, title: "SDKs", description: "Client libraries for all platforms", color: "from-[#F59E0B] to-[#D97706]" },
    { icon: <Book className="w-6 h-6" />, title: "Guides", description: "Step-by-step tutorials", color: "from-[#EC4899] to-[#DB2777]" },
  ];

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full text-[#F97316] text-sm font-semibold mb-6">
            <Book className="w-4 h-4" />Developer Documentation
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Build with SUFI</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to integrate restaurant discovery, reservations, and table management into your application
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sections.map((section, index) => (
            <motion.div key={index} variants={staggerItem}>
              <BentoCard>
                <div className={`p-4 bg-gradient-to-br ${section.color} rounded-2xl w-fit mb-4`}><div className="text-white">{section.icon}</div></div>
                <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                <button className="text-[#F97316] font-semibold hover:underline">Learn more →</button>
              </BentoCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl p-8 border border-border">
          <h2 className="text-3xl font-bold mb-6">API Example</h2>
          <div className="bg-[#0B1120] rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-green-400"><code>{`// Auto-create a reservation (Table Optimization Engine)
const reservation = await fetch("/reservations/auto-create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer <token>"
  },
  body: JSON.stringify({
    restaurant_id: 12,
    reservation_time: "2026-03-18T19:00:00",
    guests: 4,
    duration_minutes: 90
  })
});

// Response — confirmed
{
  "reservation_id": 456,
  "table_id": 8,
  "status": "pending",
  "auto_assigned": true
}

// Response — waitlisted (no tables available)
{
  "status": "waitlisted",
  "waitlist_id": 23,
  "restaurant_id": 12
}`}</code></pre>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
