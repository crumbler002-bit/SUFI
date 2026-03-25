"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/landing/Hero";
import DiscoveryPreview from "@/components/landing/DiscoveryGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import AIConciergePreview from "@/components/landing/AIConcierge";
import LiveSystem from "@/components/landing/Metrics";
import OwnerPreview from "@/components/landing/OwnerPreview";
import CTA from "@/components/landing/CTA";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Global section separator lines animate on scroll
  useEffect(() => {
    if (!containerRef.current) return;

    const separators = containerRef.current.querySelectorAll(".section-sep");
    separators.forEach((sep) => {
      gsap.fromTo(
        sep,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sep,
            start: "top 90%",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* 1. Hero — interactive system entry */}
      <Hero />

      {/* 2. Discovery — live intelligence preview */}
      <DiscoveryPreview />

      {/* 3. How It Works — system clarity */}
      <HowItWorks />

      {/* 4. AI Concierge — decision assistance */}
      <AIConciergePreview />

      {/* 5. Live System — real-time proof */}
      <LiveSystem />

      {/* 6. Owner System — two-sided platform */}
      <OwnerPreview />

      {/* 7. CTA — inevitable close */}
      <CTA />
    </div>
  );
}
