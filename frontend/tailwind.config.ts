import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#191919",
          paper: "#fffaf2",
          coral: "#ff6f61",
          lavender: "#c7b8ff",
          mint: "#9fe7d0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 60px rgba(25, 25, 25, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
