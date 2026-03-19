import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#07060C",
        bg2:     "#0F0D18",
        bg3:     "#161422",
        bg4:     "#1E1B2E",
        bg5:     "#252240",
        border:  "#23203A",
        border2: "#332F52",
        border3: "#463F6E",
        primary: "#7C3AED",
        violet:  "#A78BFA",
        violet2: "#C4B5FD",
      },
      fontFamily: {
        sans:  ["Sora", "sans-serif"],
        mono:  ["IBM Plex Mono", "monospace"],
        serif: ["DM Serif Display", "serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
