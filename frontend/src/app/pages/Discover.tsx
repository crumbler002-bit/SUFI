import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RestaurantCard } from "../components/RestaurantCard";
import { mockRestaurants, cuisineTypes } from "../lib/utils";
import { staggerContainer, staggerItem, pageTransition } from "../lib/motion";
import { getRestaurants } from "../services/restaurant";

export function Discover() {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) setRestaurants(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r: any) => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === "All" || r.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Discover Restaurants</h1>
          <p className="text-xl text-muted-foreground">Find your next favorite dining spot</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search restaurants, cuisines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />Filters
            </Button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-4 bg-card rounded-xl border border-border">
              {cuisineTypes.map((cuisine) => (
                <motion.button key={cuisine} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCuisine === cuisine ? "bg-[#F97316] text-white" : "bg-muted hover:bg-muted/80"}`}>
                  {cuisine}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <p className="text-sm text-muted-foreground mb-6">{filtered.length} restaurants found</p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-72 animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant: any) => (
              <motion.div key={restaurant.id} variants={staggerItem}>
                <RestaurantCard restaurant={{ ...restaurant, price: restaurant.price || restaurant.price_range || "$" }} layoutId={`restaurant-${restaurant.id}`} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No restaurants found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
