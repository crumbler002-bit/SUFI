"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  src: string;          // video source path e.g. "/hero.mp4"
  fontSize?: number;    // rem units, default 8
  className?: string;
}

// Renders text with a video playing through it via CSS mix-blend-mode mask
export default function VideoText({ children, src, fontSize = 8, className = "" }: Props) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* Video layer */}
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.2) saturate(1.4)" }}
      />
      {/* Text mask — white text on black bg, mix-blend-mode reveals video through letters */}
      <div
        className="relative z-10 font-black tracking-tighter uppercase text-white"
        style={{
          fontSize: `${fontSize}rem`,
          mixBlendMode: "overlay",
          WebkitTextStroke: "1px rgba(255,255,255,0.1)",
        }}
      >
        {children}
      </div>
      {/* Dark overlay to deepen contrast */}
      <div className="absolute inset-0 bg-[#0B0F1A]/40 z-0" />
    </div>
  );
}
