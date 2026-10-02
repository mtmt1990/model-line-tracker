import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // ラインカラー用 safelist (JITパージ防止)
    {
      pattern: /(bg|text|border)-(blue|emerald|amber|purple|rose|cyan|indigo|orange|teal|violet|fuchsia|lime|sky|pink|yellow)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
