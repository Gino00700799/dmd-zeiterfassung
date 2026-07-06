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
        primary: "#0f172a",
        secondary: "#64748b",
        tertiary: "#2563eb",
        accent: "#7c3aed",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        neutral: "#f8fafc",
        surface: "#ffffff",
        "surface-elevated": "#ffffff",
        "on-primary": "#ffffff",
        "on-tertiary": "#ffffff",
        "text-primary": "#0f172a",
        "text-secondary": "#64748b",
        "text-muted": "#94a3b8",
        border: "#e2e8f0",
        "border-hover": "#cbd5e1",
        "sidebar-bg": "#0f172a",
        "sidebar-text": "#94a3b8",
        "sidebar-active": "#1e293b",
        "sidebar-active-text": "#ffffff",
        // DMD Brand (legacy compatibility)
        dmd: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
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
        sm: "0 1px 2px 0 rgba(15,23,42,0.04)",
        md: "0 2px 8px -2px rgba(15,23,42,0.08), 0 1px 3px -1px rgba(15,23,42,0.04)",
        lg: "0 8px 24px -4px rgba(15,23,42,0.10), 0 2px 8px -2px rgba(15,23,42,0.06)",
        "card-hover": "0 4px 12px -2px rgba(15,23,42,0.10), 0 2px 4px -1px rgba(15,23,42,0.06)",
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