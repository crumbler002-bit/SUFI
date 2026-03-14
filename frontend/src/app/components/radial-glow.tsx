import { motion } from "motion/react";

interface RadialGlowProps {
  color?: string;
  size?: string;
  position: { x: string; y: string };
  opacity?: number;
}

export function RadialGlow({ 
  color = "rgba(59, 130, 246, 0.3)", 
  size = "600px",
  position,
  opacity = 0.3
}: RadialGlowProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        filter: "blur(80px)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [opacity, opacity * 0.7, opacity],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
