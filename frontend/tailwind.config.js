/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  safelist: [
    /* dark-mode background tokens */
    "dark:bg-slate-950", "dark:bg-slate-900", "dark:bg-slate-800",
    "dark:bg-slate-700",
    /* dark-mode border tokens */
    "dark:border-slate-700", "dark:border-slate-600",
    /* dark-mode text tokens */
    "dark:text-slate-50", "dark:text-slate-200", "dark:text-slate-300",
    "dark:text-slate-400", "dark:text-slate-500",
    /* dark-mode green accents */
    "dark:text-green-300", "dark:text-green-400",
    "dark:bg-green-900/20", "dark:bg-green-900/30", "dark:bg-green-900/40",
    "dark:border-green-800", "dark:border-green-900",
    /* dark-mode status colors */
    "dark:text-amber-300", "dark:bg-amber-900/20", "dark:bg-amber-900/40",
    "dark:text-blue-300",  "dark:bg-blue-900/20",
    "dark:text-purple-300","dark:bg-purple-900/20",
    "dark:text-red-400",   "dark:bg-red-900/20",  "dark:border-red-800",
    /* dark-mode interactive */
    "dark:hover:bg-slate-700", "dark:hover:bg-green-900/30",
    "dark:hover:border-green-500", "dark:hover:text-green-400",
  ],
  theme: {
    extend: {
      colors: {
        /* GLA University deep green palette */
        "gla-green": "#1a4d2e",
        "gla-green-light": "#2d6a4f",
        "gla-gold": "#c9a227",
        "gla-gold-light": "#e8c547",
        primary: {
          50:  "#f0faf4",
          100: "#d8f3e3",
          200: "#b3e5c8",
          300: "#7dd0a4",
          400: "#4db87c",
          500: "#2d9e5e",
          600: "#1a8048",
          700: "#1a4d2e",
          800: "#153d25",
          900: "#0e2c1a"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 4px 24px rgba(26, 77, 46, 0.10)",
        "card-hover": "0 8px 32px rgba(26, 77, 46, 0.18)",
        "gla": "0 4px 32px rgba(26, 77, 46, 0.20)"
      },
      backgroundImage: {
        "gla-gradient": "linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%)"
      }
    }
  },
  plugins: []
};
