import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      tablet: { max: "640px" },
      medium: { max: "768px" },
      laptop: { max: "1024px" },
      noheader: { max: "1680px" },
      desktop: { min: "1280px" },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
