import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Card } from "./ui/card";

interface FloatingCardProps {
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  delay: number;
  position: { x: string; y: string };
}

export function FloatingCard({ name, image, rating, cuisine, delay, position }: FloatingCardProps) {
  return (
    <motion.div
      className="absolute z-10"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: [50, 0, 0, -30],
        scale: [0.8, 1, 1, 0.9],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatDelay: 8,
      }}
    >
      <Card className="w-64 p-3 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
        <img 
          src={image} 
          alt={name}
          className="w-full h-32 object-cover rounded-lg mb-2"
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">{name}</p>
            <p className="text-gray-400 text-xs">{cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium">{rating}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
