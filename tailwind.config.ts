import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { green:"#52c871", mint:"#b4e8c5", lime:"#85df42", ink:"#0B0F0C", paper:"#FFFFFF", bg:"#F3F6F2", muted:"#6B756C", line:"#E6EBE5", warn:"#C2410C" },
      fontFamily: { sans:["'Plus Jakarta Sans'","sans-serif"], mono:["'IBM Plex Mono'","monospace"] },
    },
  },
  plugins: [],
};
export default config;
