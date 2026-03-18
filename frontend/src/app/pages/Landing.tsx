import { motion } from "motion/react";
import { Search, Sparkles, TrendingUp, BarChart3, Users, Calendar, Zap } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { BentoCard } from "../components/BentoCard";
import { RestaurantCard } from "../components/RestaurantCard";
import { mockRestaurants } from "../lib/utils";
import { staggerContainer, staggerItem } from "../lib/motion";

export function Landing() {
  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: "AI Concierge", description: "Let AI find your perfect dining experience" },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Smart Recommendations", description: "Personalized suggestions based on your preferences" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics Dashboard", description: "Track reservations and customer insights" },
    { icon: <Users className="w-6 h-6" />, title: "Waitlist Management", description: "Convert waitlists into confirmed reservations" },
    { icon: <Calendar className="w-6 h-6" />, title: "Table Optimization", description: "Maximize seating efficiency with AI" },
    { icon: <Zap className="w-6 h-6" />, title: "Real-time Updates", description: "Instant notifications and confirmations" },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/10 via-background to-[#6366F1]/10" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-20 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 left-20 w-96 h-96 bg-[#6366F1]/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-full text-[#F97316] text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Next-Generation Restaurant Platform
              </span>
            </motion.div>
            <motion.h1 variants={staggerItem} className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[#F97316] via-[#ea6a0f] to-[#6366F1] bg-clip-text text-transparent">
              Discover Your<br />Perfect Dining
            </motion.h1>
            <motion.p variants={staggerItem} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              AI-powered restaurant discovery, intelligent reservations, and seamless table management
            </motion.p>
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/discover">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Search className="w-5 h-5 mr-2" />Explore Restaurants
                </Button>
              </Link>
              <Link to="/ai-concierge">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />Try AI Concierge
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={staggerItem} className="mt-20 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {mockRestaurants.slice(0, 3).map((restaurant, index) => (
                <motion.div key={restaurant.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + index * 0.2 }}>
                  <RestaurantCard restaurant={restaurant} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">Powerful features for restaurants and diners</p>
          </motion.div>
          <div className="grid grid-cols-12 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="col-span-12 md:col-span-6 lg:col-span-4">
                <BentoCard>
                  <div className="p-4 bg-gradient-to-br from-[#F97316]/10 to-[#6366F1]/10 rounded-2xl w-fit mb-4">
                    <div className="text-[#F97316]">{feature.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-br from-[#F97316] to-[#ea6a0f]">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Dining Experience?</h2>
          <p className="text-xl mb-12 opacity-90">Join thousands of restaurants and diners using SUFI</p>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="bg-white text-[#F97316] hover:bg-white/90 border-white text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
