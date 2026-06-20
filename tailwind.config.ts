import type { Config } from "tailwindcss";

/**
 * Referral GPS — "Soft calm / pastel" theme.
 * Mint primary + lavender secondary on warm off-white surfaces.
 * Colours are exposed as CSS variables in index.css so components stay theme-driven.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mint — primary brand / "ready / go"
        primary: {
          50: "#f0fdf9",
          100: "#d6faee",
          200: "#aef2dd",
          300: "#79e6c6",
          400: "#43d0a9",
          500: "#1fb88e",
          600: "#129473",
          700: "#11765e",
          800: "#125e4c",
          900: "#114d40",
        },
        // Lavender — secondary / AI accents
        lavender: {
          50: "#f5f4ff",
          100: "#ecebfe",
          200: "#dad9fd",
          300: "#bfbcfa",
          400: "#a097f5",
          500: "#8472ee",
          600: "#7152e0",
          700: "#6041c5",
          800: "#50379e",
          900: "#43317e",
        },
        // Warm neutrals for surfaces / text
        sand: {
          50: "#fdfcfb",
          100: "#f8f6f3",
          200: "#f0ece6",
          300: "#e3ddd4",
          400: "#cabfb0",
          500: "#a99d8b",
          600: "#857a69",
          700: "#655c4f",
          800: "#433d35",
          900: "#2a2620",
        },
        success: "#1fb88e",
        warning: "#e8a33d",
        danger: "#e0617a",
        info: "#5b9bd5",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.1rem",
        "3xl": "1.6rem",
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(80, 55, 158, 0.10), 0 2px 6px -2px rgba(80, 55, 158, 0.06)",
        "soft-lg": "0 18px 48px -12px rgba(80, 55, 158, 0.18)",
        glow: "0 0 0 4px rgba(132, 114, 238, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-soft": "pulse-soft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
