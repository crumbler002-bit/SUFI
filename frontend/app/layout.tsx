import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono, DM_Serif_Display } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Toaster } from "sonner";

const sora  = Sora({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-sora", display: "swap" });
const mono  = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono", display: "swap" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"], style: ["normal","italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: "SUFI — AI Restaurant Operating System",
  description: "Autonomous, real-time, AI-powered restaurant operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${mono.variable} ${serif.variable}`}>
      <body className="font-sans antialiased bg-[#07060C] text-[#ede9ff]">
        <Providers>
          <CommandPalette />
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F0D18", border: "0.5px solid #332F52",
                color: "#ede9ff", fontFamily: "Sora, sans-serif", fontSize: "12px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
