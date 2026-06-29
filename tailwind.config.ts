import type {Config} from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./messages/**/*.json"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        paper: "#fafafa",
        foreground: "#020817",
        background: "#ffffff",
        card: "#ffffff",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        border: "#e2e8f0",
        primary: "#6467f2",
        "primary-foreground": "#ffffff",
        violet: "#6467f2",
        violetDark: "#5659df",
        lavender: "#f8f8ff",
        sage: "#6f8f72",
        coral: "#e46d5f",
        brass: "#b88a3b",
        tide: "#6257d9"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px rgba(15, 23, 42, 0.06)",
        lifted: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 1px rgba(100, 103, 242, 0.18), 0 14px 36px rgba(100, 103, 242, 0.14)"
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
