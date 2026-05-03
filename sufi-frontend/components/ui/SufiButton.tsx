import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
}

export default function SufiButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    ghost:
      "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white",
    danger: "bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
