import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#FFFFFF",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#D4D4D4",
          300: "#B3B3B3",
          400: "#9A9A9A",
          500: "#6F6F6F",
          700: "#2B2B2B",
          900: "#000000",
        },
        // Semantic aliases (kept minimal — no accent color, monochrome by design)
        good: "#2B2B2B",
        warn: "#6F6F6F",
        bad: "#000000",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "ui-monospace",
          "monospace",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
