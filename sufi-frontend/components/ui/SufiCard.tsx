import { ReactNode, HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}

export default function SufiCard({ children, glow, className = "", ...rest }: Props) {
  return (
    <div
      className={`bg-card border border-white/[0.08] rounded-xl p-5 transition-all hover:border-white/20 ${glow ? "shadow-[0_0_20px_rgba(79,140,255,0.15)] border-accent/20" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
