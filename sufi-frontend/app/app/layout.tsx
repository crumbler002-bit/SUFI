import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SUFI — Explore",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
