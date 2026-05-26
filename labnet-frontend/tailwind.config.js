/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      aspectRatio: {
        'video': '16 / 9',
      },
      fontFamily: { inter: ["Inter", "sans-serif"] },
      animation: { "fade-in": "fadeIn 0.8s ease-out" },
      keyframes: { fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } } },
    },
  },
  plugins: [],
}