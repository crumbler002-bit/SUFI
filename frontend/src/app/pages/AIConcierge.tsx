import { motion } from "motion/react";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { AIChat } from "../components/AIChat";
import { BentoCard } from "../components/BentoCard";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";

export function AIConcierge() {
  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: "Smart Recommendations", description: "AI analyzes your preferences to suggest perfect matches" },
    { icon: <Zap className="w-6 h-6" />, title: "Instant Results", description: "Get personalized restaurant suggestions in seconds" },
    { icon: <Target className="w-6 h-6" />, title: "Context Aware", description: "Considers location, time, and dining preferences" },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Learning System", description: "Gets better with every interaction" },
  ];

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full text-[#F97316] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />Powered by Advanced AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#F97316] to-[#6366F1] bg-clip-text text-transparent">
            Your Personal AI Concierge
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Let our AI assistant help you discover the perfect restaurant based on your mood, preferences, and dining needs
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <AIChat />
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold mb-6">How It Works</h3>
            {features.map((feature, index) => (
              <motion.div key={index} variants={staggerItem} whileHover={{ scale: 1.02, x: 4 }} className="bg-card p-6 rounded-2xl border border-border">
                <div className="p-3 bg-[#F97316]/10 rounded-xl w-fit mb-4"><div className="text-[#F97316]">{feature.icon}</div></div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Try These Prompts</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {["Find romantic Italian restaurants nearby", "I want sushi for lunch under $30", "Best restaurants for a business dinner"].map((prompt, index) => (
              <motion.button key={index} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="p-6 bg-card rounded-2xl border-2 border-border hover:border-[#F97316] transition-colors text-left">
                <Sparkles className="w-5 h-5 text-[#F97316] mb-3" />
                <p className="font-medium">{prompt}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
