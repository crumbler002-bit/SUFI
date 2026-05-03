import { InputHTMLAttributes } from "react";

export default function SufiInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors placeholder-gray-500 ${props.className ?? ""}`}
    />
  );
}
