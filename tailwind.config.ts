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
        cardWarm: "#F7F7F2",
        borderSoft: "#DFE2DA",
        line: "#C9D3C4",
        primaryText: "#111111",
        secondaryText: "#5F6762",
        mutedText: "#7A827C",
        stadiumNavy: "#07111F",
        deepNavy: "#0B1730",
        nightNavy: "#020712",
        worldCupBlue: "#1B4DFF",
        worldCupBlueDark: "#143ED6",
        pitchGreen: "#0E7A4F",
        pitchGreenDark: "#07563A",
        pitchMist: "#E9F5EE",
        mexicoGreen: "#00A86B",
        canadaRed: "#E63946",
        canadaRedDark: "#B42330",
        warmGold: "#F2B84B",
        goldMist: "#FFF4D6",
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
      boxShadow: {
        card: "0 18px 55px rgba(7, 17, 31, 0.08)",
        elevated: "0 26px 90px rgba(7, 17, 31, 0.16)",
        action: "0 14px 34px rgba(27, 77, 255, 0.24)",
        pitch: "0 18px 70px rgba(7, 86, 58, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [forms],
};

export default config;
