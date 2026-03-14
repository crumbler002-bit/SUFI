import { motion, useScroll, useTransform } from "motion/react";
import { Search, MapPin, Calendar, Users, TrendingUp, Star, Clock, Utensils, BarChart3, DollarSign, Check, Sparkles, Zap, Award } from "lucide-react";
import { BackgroundBeams } from "../components/background-beams";
import { FloatingCard } from "../components/floating-card";
import { TypewriterText } from "../components/typewriter-text";
import { AnimatedCounter } from "../components/animated-counter";
import { RadialGlow } from "../components/radial-glow";
import { FloatingParticles } from "../components/floating-particles";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { useRef } from "react";

const floatingRestaurants = [
  {
    name: "Le Bernardin",
    image: "https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.8,
    cuisine: "French Fine Dining",
    position: { x: "10%", y: "20%" },
    delay: 0,
  },
  {
    name: "Osteria Mozza",
    image: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.6,
    cuisine: "Italian",
    position: { x: "75%", y: "30%" },
    delay: 1,
  },
  {
    name: "Nobu",
    image: "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    rating: 4.9,
    cuisine: "Japanese",
    position: { x: "15%", y: "60%" },
    delay: 2,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="min-h-screen" style={{ background: "linear-gradient(to bottom, #050505, #0B0F1A, #0F172A)" }}>
      {/* Hero Section - Dark Immersive */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />
        <BackgroundBeams />
        <FloatingParticles />
        <RadialGlow color="rgba(6, 182, 212, 0.15)" size="800px" position={{ x: "20%", y: "10%" }} />
        <RadialGlow color="rgba(124, 58, 237, 0.15)" size="700px" position={{ x: "70%", y: "50%" }} />
        
        {/* Floating restaurant cards */}
        {floatingRestaurants.map((restaurant, i) => (
          <FloatingCard key={i} {...restaurant} />
        ))}

        {/* Main hero content */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 px-4 py-1.5 backdrop-blur-xl">
              <Sparkles className="w-3 h-3 mr-2 inline" />
              Powered by AI
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <TypewriterText text="Discover Restaurants" delay={1000} speed={60} />
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" style={{ textShadow: "0 0 80px rgba(6, 182, 212, 0.5)" }}>
              Instantly
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Reserve tables in seconds. Experience dining reimagined with SUFI's AI-powered platform.
          </motion.p>

          {/* Animated search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-50 blur-xl transition" />
              <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full p-2" style={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)" }}>
                <Search className="w-5 h-5 text-cyan-400 ml-4" />
                <Input
                  placeholder="Search restaurants, cuisines, or locations..."
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0"
                />
                <Button 
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/50"
                  onClick={() => navigate('/discover')}
                >
                  Explore
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/50"
              onClick={() => navigate('/discover')}
            >
              Find Restaurants
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 backdrop-blur-xl"
              onClick={() => navigate('/owner/dashboard')}
            >
              For Owners
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-cyan-400/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-cyan-400/60 rounded-full" style={{ boxShadow: "0 0 10px rgba(6, 182, 212, 0.8)" }} />
          </div>
        </motion.div>
      </motion.section>

      {/* Platform Statistics Section - Dark Immersive */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#0B0F1A] to-[#050505]" />
        <RadialGlow color="rgba(34, 197, 94, 0.1)" size="600px" position={{ x: "50%", y: "50%" }} />
        <FloatingParticles />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/30 text-green-300 px-4 py-2 backdrop-blur-xl">
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Growing Fast
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Millions
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              The fastest growing restaurant platform
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 25000, suffix: "+", label: "Restaurants Listed", icon: Utensils, color: "cyan" },
              { value: 1000000, suffix: "+", label: "Reservations Made", icon: Calendar, color: "blue" },
              { value: 120000, suffix: "+", label: "Active Users", icon: Users, color: "purple" },
              { value: 150, suffix: "+", label: "Cities Covered", icon: MapPin, color: "green" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="p-8 text-center bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <stat.icon className={`w-8 h-8 mx-auto mb-4 text-${stat.color}-400`} />
                  <div className={`text-4xl font-bold text-white mb-2`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-gray-400 relative z-10">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Discovery Demo Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0B0F1A] to-[#0F172A]" />
        <RadialGlow color="rgba(59, 130, 246, 0.15)" size="900px" position={{ x: "10%", y: "30%" }} />
        <RadialGlow color="rgba(124, 58, 237, 0.15)" size="700px" position={{ x: "80%", y: "60%" }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 items-center mb-32"
          >
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 backdrop-blur-xl">
                <Zap className="w-3 h-3 mr-2 inline" />
                Discovery
              </Badge>
              <h2 className="text-5xl font-bold text-white mb-6">
                Find Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Perfect Restaurant
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Browse thousands of restaurants with intelligent filters. Search by cuisine, location, price range, and ratings. Our AI learns your preferences to deliver personalized recommendations.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Sparkles, text: "Smart search with AI recommendations", color: "cyan" },
                  { icon: Clock, text: "Real-time availability", color: "blue" },
                  { icon: Star, text: "Verified reviews and ratings", color: "purple" },
                  { icon: MapPin, text: "Interactive map view", color: "green" },
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 border border-${feature.color}-400/30 flex items-center justify-center backdrop-blur-xl`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                    </div>
                    <span className="text-gray-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <Card className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <img
                  src="https://images.unsplash.com/photo-1765021096871-80e396247f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                  alt="Restaurant discovery"
                  className="w-full h-[400px] object-cover rounded-xl mb-4 relative z-10"
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-white">4.8</span>
                    <span className="text-gray-400">(2.4k reviews)</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Modern Fine Dining</h3>
                  <p className="text-gray-400">Contemporary • $$$ • 2 miles away</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Instant Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 items-center mb-32"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotateY: -5 }}
              className="relative order-2 md:order-1"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <Card className="p-8 bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Reserve Your Table</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Date & Time</p>
                      <p className="text-gray-400">March 15, 2026 • 7:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Party Size</p>
                      <p className="text-gray-400">4 guests</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50">
                    Confirm Reservation
                  </Button>
                </div>
              </Card>
            </motion.div>
            <div className="order-1 md:order-2">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 backdrop-blur-xl">
                <Zap className="w-3 h-3 mr-2 inline" />
                Instant Booking
              </Badge>
              <h2 className="text-5xl font-bold text-white mb-6">
                Reserve in{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Seconds
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                No more waiting on hold or delayed confirmations. Book your table instantly with real-time availability. Receive immediate confirmation and easy management of your reservations.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "Real-time table availability", color: "purple" },
                  { icon: Check, text: "Instant confirmation", color: "pink" },
                  { icon: Calendar, text: "Easy modification & cancellation", color: "purple" },
                  { icon: Clock, text: "Automatic reminders", color: "pink" },
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 border border-${feature.color}-400/30 flex items-center justify-center backdrop-blur-xl`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                    </div>
                    <span className="text-gray-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trending Restaurants Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 text-orange-300 px-4 py-2 backdrop-blur-xl">
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Trending Now
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Discover{" "}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Hidden Gems
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI learns your preferences and dining habits to suggest restaurants you'll love. Get trending spots and personalized recommendations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Italian Trattoria", img: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", badge: "Trending", color: "orange" },
              { name: "Sushi Bar", img: "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", badge: "New", color: "cyan" },
              { name: "French Bistro", img: "https://images.unsplash.com/photo-1577056922428-a511301a562d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", badge: "Popular", color: "purple" },
              { name: "Steakhouse", img: "https://images.unsplash.com/photo-1772285466464-8ccda2c3be92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", badge: "Premium", color: "green" },
            ].map((resto, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <Card className="p-3 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/20 shadow-xl hover:shadow-2xl transition-all overflow-hidden group">
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img src={resto.img} alt={resto.name} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                    <Badge className={`absolute top-2 right-2 bg-gradient-to-r from-${resto.color}-500/90 to-${resto.color}-600/90 text-white border-0 text-xs backdrop-blur-xl shadow-lg`}>
                      {resto.badge}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm text-white">{resto.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Platform Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#0B0F1A] to-[#050505]" />
        <RadialGlow color="rgba(249, 115, 22, 0.15)" size="800px" position={{ x: "70%", y: "40%" }} />
        <FloatingParticles />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 text-orange-300 backdrop-blur-xl">
              <Award className="w-3 h-3 mr-2 inline" />
              For Restaurant Owners
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Powerful Tools for Your{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Business
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Manage reservations, track analytics, and grow your restaurant with our comprehensive dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-3xl" />
            <Card className="p-8 bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
              
              <div className="grid md:grid-cols-3 gap-6 mb-8 relative z-10">
                {[
                  { icon: BarChart3, label: "Total Reservations", value: "1,234", change: "+23%", color: "blue" },
                  { icon: DollarSign, label: "Revenue This Month", value: "$45.2k", change: "+18%", color: "green" },
                  { icon: TrendingUp, label: "Average Rating", value: "4.8", change: "342 reviews", color: "purple" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className={`p-6 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 border border-${stat.color}-400/30 backdrop-blur-xl`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                      <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                      <p className="text-gray-400">{stat.label}</p>
                      <p className="text-green-400 text-sm mt-2">↑ {stat.change}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative z-10">
                <h3 className="text-xl font-bold text-white mb-4">Upcoming Reservations</h3>
                <div className="space-y-3">
                  {[
                    { time: "6:00 PM", name: "John Smith", guests: 4, table: "A5" },
                    { time: "6:30 PM", name: "Sarah Johnson", guests: 2, table: "B3" },
                    { time: "7:00 PM", name: "Michael Chen", guests: 6, table: "C1" },
                    { time: "7:30 PM", name: "Emily Davis", guests: 3, table: "A2" },
                  ].map((reservation, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-cyan-400/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-white">{reservation.time}</span>
                        </div>
                        <span className="text-gray-300">{reservation.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">{reservation.guests} guests</span>
                        <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 backdrop-blur-xl">
                          Table {reservation.table}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0B0F1A] to-[#0F172A]" />
        <RadialGlow color="rgba(124, 58, 237, 0.15)" size="700px" position={{ x: "50%", y: "50%" }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Simple,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Choose the perfect plan for your restaurant
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic Listing",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "Restaurant profile",
                  "Basic reservation management",
                  "Up to 50 bookings/month",
                  "Email support",
                ],
                popular: false,
                color: "cyan",
              },
              {
                name: "Premium Listing",
                price: "$99",
                period: "/month",
                description: "Most popular for growing restaurants",
                features: [
                  "Everything in Basic",
                  "Unlimited bookings",
                  "Analytics dashboard",
                  "Priority placement",
                  "24/7 support",
                ],
                popular: true,
                color: "purple",
              },
              {
                name: "Featured Listing",
                price: "$199",
                period: "/month",
                description: "For established restaurants",
                features: [
                  "Everything in Premium",
                  "Featured in search results",
                  "Social media promotion",
                  "Custom branding",
                  "Dedicated account manager",
                ],
                popular: false,
                color: "pink",
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="relative h-full">
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1 shadow-lg shadow-purple-500/50">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className={`absolute -inset-1 bg-gradient-to-r from-${plan.color}-500/20 to-${plan.color}-600/20 rounded-2xl blur-xl ${plan.popular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                  <Card className={`p-8 relative h-full bg-black/40 backdrop-blur-2xl border ${plan.popular ? 'border-purple-500/50' : 'border-white/10 hover:border-white/20'} transition-all`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-${plan.color}-500/5 to-transparent rounded-2xl`} />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        {plan.period && <span className="text-gray-400">{plan.period}</span>}
                      </div>
                      <p className="text-gray-400 mb-6">{plan.description}</p>
                      <Button 
                        className={`w-full mb-6 ${plan.popular ? `bg-gradient-to-r from-${plan.color}-600 to-pink-600 hover:from-${plan.color}-700 hover:to-pink-700 shadow-lg shadow-${plan.color}-500/50` : `bg-white/10 hover:bg-white/20 border border-white/20`}`}
                      >
                        Get Started
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br from-${plan.color}-500/20 to-${plan.color}-600/20 border border-${plan.color}-400/30 flex items-center justify-center`}>
                              <Check className={`w-3 h-3 text-${plan.color}-400`} />
                            </div>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] to-[#050505]" />
        <BackgroundBeams />
        <RadialGlow color="rgba(6, 182, 212, 0.2)" size="1000px" position={{ x: "50%", y: "50%" }} />
        <FloatingParticles />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dining Experience?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join thousands of users discovering and reserving restaurants with SUFI.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-8 py-6 text-lg shadow-2xl shadow-cyan-500/50"
                onClick={() => navigate('/discover')}
              >
                Start Discovering
              </Button>
              <Button 
                size="lg" 
                className="rounded-full border-2 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 px-8 py-6 text-lg backdrop-blur-xl"
                variant="outline"
                onClick={() => navigate('/owner/dashboard')}
              >
                List Your Restaurant
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-black" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SUFI</h3>
              <p className="text-gray-400">
                Discover restaurants. Reserve instantly.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Discover</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Reservations</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">For Owners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2026 SUFI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
