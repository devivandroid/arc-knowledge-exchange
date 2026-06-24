import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          blue: "#06B6D4",
          mint: "#65f7b0",
          ink: "#0B1020",
          panel: "#0F172A",
          border: "#1E293B"
        },
        brand: {
          purple: "#7C3AED",
          indigo: "#5B21B6",
          blue: "#2563EB",
          cyan: "#06B6D4"
        }
      },
      boxShadow: {
        glow: "0 0 44px rgba(37, 99, 235, 0.22)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
