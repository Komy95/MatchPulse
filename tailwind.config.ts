import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#FAFAF7",
        card: "#FFFFFF",
        borderSoft: "#E8E8E3",
        primaryText: "#111111",
        secondaryText: "#6B6B6B",
        worldCupBlue: "#1B4DFF",
        mexicoGreen: "#00A86B",
        canadaRed: "#E63946",
        warmGold: "#F2B84B",
        softSky: "#EAF1FF",
        softGreen: "#EAF8F1",
        softRed: "#FDECEC",
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [forms],
};

export default config;
