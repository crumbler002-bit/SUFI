import { motion } from "motion/react";
import { Link } from "react-router";
import { Star, MapPin, Clock } from "lucide-react";
import { hoverLift } from "../lib/motion";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  image: string;
  distance: string;
  availability: string;
  tags?: string[];
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  layoutId?: string;
}

export function RestaurantCard({ restaurant, layoutId }: RestaurantCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <motion.div
        layoutId={layoutId}
        whileHover={hoverLift}
        className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow cursor-pointer"
      >
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
            <span className="font-semibold text-sm">{restaurant.rating}</span>
          </div>
          <div className="absolute top-3 left-3 bg-[#F97316] text-white px-3 py-1 rounded-full text-xs font-semibold">
            {restaurant.price}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-[#F97316] transition-colors">
            {restaurant.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{restaurant.cuisine}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={restaurant.availability === "Available today" ? "text-green-600" : "text-orange-600"}>
                {restaurant.availability}
              </span>
            </div>
          </div>
          {restaurant.tags && (
            <div className="flex flex-wrap gap-2">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-muted rounded-lg text-xs font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
