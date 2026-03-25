"use client";

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Primary orb — top left */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      {/* Tertiary orb — bottom right */}
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px] animate-pulse-slow" />
      {/* Secondary orb — center */}
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] animate-float" />
    </div>
  );
}
