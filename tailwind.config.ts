import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./messages/**/*.json"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        paper: "#f8f3e8",
        sage: "#6f8f72",
        coral: "#e46d5f",
        brass: "#b88a3b",
        tide: "#0e6f7c"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 32, 0.04), 0 8px 24px rgba(16, 24, 32, 0.06)",
        card: "0 2px 6px rgba(16, 24, 32, 0.05), 0 16px 40px rgba(16, 24, 32, 0.08)",
        lifted: "0 22px 70px rgba(16, 24, 32, 0.13)",
        glow: "0 0 0 1px rgba(14, 111, 124, 0.12), 0 18px 50px rgba(14, 111, 124, 0.18)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      },
      keyframes: {
        "fade-up": {
          "0%": {opacity: "0", transform: "translateY(10px)"},
          "100%": {opacity: "1", transform: "translateY(0)"}
        },
        "fade-in": {
          "0%": {opacity: "0"},
          "100%": {opacity: "1"}
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease both"
      }
    }
  },
  plugins: []
};

export default config;
