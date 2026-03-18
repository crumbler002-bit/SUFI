import { motion } from "motion/react";
import { TrendingUp, Flame, Award, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { RestaurantCard } from "../components/RestaurantCard";
import { mockRestaurants } from "../lib/utils";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";
import { getTrending } from "../services/restaurant";

export function Trending() {
  const [trending, setTrending] = useState<any[]>(mockRestaurants);

  useEffect(() => {
    getTrending()
      .then((data: any) => { if (Array.isArray(data) && data.length > 0) setTrending(data); })
      .catch(() => {});
  }, []);

  const categories = [
    { icon: <Flame className="w-5 h-5" />, title: "Hot Right Now", restaurants: trending.slice(0, 3), color: "from-red-500 to-orange-500" },
    { icon: <Award className="w-5 h-5" />, title: "Top Rated", restaurants: trending.slice(3, 6), color: "from-yellow-500 to-amber-500" },
    { icon: <Clock className="w-5 h-5" />, title: "Recently Added", restaurants: trending.slice(0, 3), color: "from-blue-500 to-purple-500" },
  ];

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#F97316] to-[#ea6a0f] rounded-2xl"><TrendingUp className="w-8 h-8 text-white" /></div>
            <div>
              <h1 className="text-5xl font-bold">Trending Now</h1>
              <p className="text-xl text-muted-foreground mt-2">Discover what's popular in your area</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-16">
          {categories.map((category, categoryIndex) => (
            <motion.div key={categoryIndex} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: categoryIndex * 0.1 }}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl`}><div className="text-white">{category.icon}</div></div>
                <h2 className="text-3xl font-bold">{category.title}</h2>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.restaurants.map((restaurant: any) => (
                  <motion.div key={restaurant.id} variants={staggerItem}>
                    <RestaurantCard restaurant={{ ...restaurant, price: restaurant.price || restaurant.price_range || "$" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 grid md:grid-cols-3 gap-6">
          {[{ label: "Active Diners", value: "50K+" }, { label: "Reservations Today", value: "1,234" }, { label: "Partner Restaurants", value: "500+" }].map((stat, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05, y: -4 }} className="bg-card p-8 rounded-2xl border border-border text-center">
              <p className="text-4xl font-bold text-[#F97316] mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
