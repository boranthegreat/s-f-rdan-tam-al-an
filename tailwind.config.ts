import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "rgba(15, 23, 42, 0.66)",
        line: "rgba(148, 163, 184, 0.18)",
        mint: "#5eead4",
        skyglow: "#38bdf8"
      },
      boxShadow: {
        glow: "0 0 60px rgba(56, 189, 248, 0.16)",
        card: "0 24px 80px rgba(2, 6, 23, 0.45)"
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at top left, rgba(94, 234, 212, 0.16), transparent 30%), radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.14), transparent 28%), linear-gradient(135deg, #07111f 0%, #0f172a 50%, #020617 100%)"
      }
    }
  },
  plugins: []
};

export default config;
