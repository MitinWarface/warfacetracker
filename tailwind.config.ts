import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Military dark palette
        wf: {
          bg:       "#0a0c0e",
          surface:  "#111418",
          card:     "#161b22",
          border:   "#21262d",
          muted:    "#1c2128",
          accent:   "#ff4400",   // Warface orange-red
          "accent-dim": "#cc3600",
          red:      "#d73a49",
          green:    "#3fb950",
          blue:     "#58a6ff",
          text:     "#e6edf3",
          muted_text: "#8b949e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0a0c0e 0%, #111418 50%, #0d1117 100%)",
        "card-gradient":
          "linear-gradient(145deg, #161b22 0%, #111418 100%)",
        "gold-gradient":
          "linear-gradient(90deg, #ff4400 0%, #ff6600 50%, #ff4400 100%)",
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer:    "shimmer 1.5s infinite",
        "bar-fill": "barFill 1s ease-out forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        barFill: { from: { width: "0%" } },
      },
    },
  },
  plugins: [animate],
};

export default config;
