import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
	],
  theme: {},
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config