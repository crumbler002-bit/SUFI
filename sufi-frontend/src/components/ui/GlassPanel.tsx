import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassPanel({ children, className = "", hover = false }: GlassPanelProps) {
  return (
    <div className={`${hover ? "glass-panel-hover" : "glass-panel"} ${className}`}>
      {children}
    </div>
  );
}
