import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // DMD Studio Brand Farben (von dmd-studio.de)
        primary: "#51c878",
        "primary-dark": "#3da85e",
        secondary: "#475467",
        tertiary: "#3da85e",
        accent: "#7c3aed",
        success: "#17b26a",
        warning: "#f79009",
        danger: "#ef4444",
        neutral: "#f9fafb",
        surface: "#ffffff",
        "surface-elevated": "#ffffff",
        "on-primary": "#ffffff",
        "on-tertiary": "#ffffff",
        "text-primary": "#101828",
        "text-secondary": "#475467",
        "text-muted": "#667085",
        border: "#eaecf0",
        "border-hover": "#d0d5dd",
        "sidebar-bg": "#0b0c0f",
        "sidebar-text": "#8a8f9a",
        "sidebar-active": "#15171c",
        "sidebar-active-text": "#ecedee",
        // DMD Brand Scale (Grün)
        brand: {
          25: "#f0fdf4",
          50: "#dcfce7",
          100: "#bbf7d0",
          200: "#86efac",
          300: "#4ade80",
          400: "#51c878",
          500: "#3da85e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Legacy compatibility
        dmd: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#51c878",
          500: "#3da85e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontSize: {
        "stat-xl": ["2.25rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.03em" }],
        "label-caps": ["0.6875rem", { fontWeight: "600", letterSpacing: "0.08em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(16,24,40,0.04)",
        md: "0 2px 8px -2px rgba(16,24,40,0.08), 0 1px 3px -1px rgba(16,24,40,0.04)",
        lg: "0 8px 24px -4px rgba(16,24,40,0.10), 0 2px 8px -2px rgba(16,24,40,0.06)",
        "card-hover": "0 4px 12px -2px rgba(16,24,40,0.10), 0 2px 4px -1px rgba(16,24,40,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;