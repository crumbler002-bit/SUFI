"use client";

import dynamic from "next/dynamic";
import MotionProvider from "@/components/core/MotionProvider";
import CursorSystem from "@/components/core/CursorSystem";
import FloatingElements from "@/components/core/FloatingElements";
import Navbar from "@/components/layout/Navbar";

// Dynamic import Three.js to avoid SSR issues
const IntelligenceField = dynamic(
  () => import("@/components/core/IntelligenceField"),
  { ssr: false }
);

export default function ClientProviders() {
  return (
    <>
      <MotionProvider />
      <CursorSystem />
      <IntelligenceField />
      <FloatingElements />
      <Navbar />
    </>
  );
}

