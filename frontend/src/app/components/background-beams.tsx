import { motion } from "motion/react";

export function BackgroundBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[500px] w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
          initial={{ 
            left: `${10 + i * 15}%`,
            top: '-500px',
            opacity: 0,
          }}
          animate={{
            top: '100%',
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
