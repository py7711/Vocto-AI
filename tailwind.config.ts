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
      boxShadow: {
        lifted: "0 22px 70px rgba(16, 24, 32, 0.13)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
