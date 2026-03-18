import { motion } from "motion/react";
import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Clock, Phone, ArrowLeft } from "lucide-react";
import { mockRestaurants } from "../lib/utils";
import { ReservationWidget } from "../components/ReservationWidget";
import { pageTransition } from "../lib/motion";
import { Button } from "../components/ui/button";
import { getRestaurant } from "../services/restaurant";

export function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(mockRestaurants.find((r) => r.id === id) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getRestaurant(id)
      .then((data: any) => { if (data?.id) setRestaurant(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-28 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" /></div>;

  if (!restaurant) return (
    <div className="min-h-screen pt-28 px-6 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
        <Link to="/discover"><Button>Back to Discover</Button></Link>
      </div>
    </div>
  );

  return (
    <motion.div layoutId={`restaurant-${id}`} initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link to="/discover"><Button variant="ghost" className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Discover</Button></Link>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative h-96 rounded-3xl overflow-hidden">
          <img src={restaurant.image || restaurant.banner_url} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">{restaurant.cuisine}</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold">{restaurant.price || restaurant.price_range}</span>
            </div>
            <h1 className="text-5xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-xl opacity-90">{restaurant.description}</p>
          </div>
          <div className="absolute top-8 right-8 bg-white dark:bg-card px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
            <Star className="w-5 h-5 fill-[#F97316] text-[#F97316]" />
            <span className="font-bold text-lg">{restaurant.rating}</span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border"><MapPin className="w-6 h-6 text-[#F97316] mb-3" /><p className="text-sm text-muted-foreground mb-1">Address</p><p className="font-semibold">{restaurant.address || "See map"}</p></div>
              <div className="bg-card p-6 rounded-2xl border border-border"><Clock className="w-6 h-6 text-[#F97316] mb-3" /><p className="text-sm text-muted-foreground mb-1">Availability</p><p className="font-semibold">{restaurant.availability || "Check slots"}</p></div>
              <div className="bg-card p-6 rounded-2xl border border-border"><Phone className="w-6 h-6 text-[#F97316] mb-3" /><p className="text-sm text-muted-foreground mb-1">Rating</p><p className="font-semibold">{restaurant.rating} ★ ({restaurant.total_reviews || 0} reviews)</p></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">{restaurant.description || restaurant.about || "Experience exceptional service and carefully curated menus."}</p>
            </motion.div>
          </div>
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sticky top-28">
              <ReservationWidget restaurantId={Number(id)} restaurantName={restaurant.name} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
