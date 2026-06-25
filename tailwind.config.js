/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: "#e6f1ff",
          100: "#b8d4ff",
          200: "#8ab8ff",
          300: "#5c9cff",
          400: "#2e80ff",
          500: "#0064ff",
          600: "#0050cc",
          700: "#003c99",
          800: "#002866",
          900: "#001433",
          950: "#000a1a",
        },
        cyan: {
          glow: "#00f0ff",
          soft: "#4fd1c5",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.06)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        serif: ["Playfair Display", "Georgia", "serif"],
        script: ["Dancing Script", "cursive"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
