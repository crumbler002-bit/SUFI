import type { Metadata } from "next";
import ClientProviders from "@/components/core/ClientProviders";
import PageTransitionWrapper from "@/components/core/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUFI OS — Intelligence for Real-World Decisions",
  description:
    "SUFI is a living intelligence system that understands intent, predicts preferences, and evolves with every interaction. AI-powered restaurant discovery and reservation.",
  keywords: ["SUFI", "AI", "restaurant", "intelligence", "discovery", "reservation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grid-bg">
        <ClientProviders />
        <div className="relative z-10">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </div>
      </body>
    </html>
  );
}

