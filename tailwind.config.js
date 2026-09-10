/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F9F5F0',
        roseQuartz: '#FACCD9',
        dustyRose: '#FBAF46',
        coral: '#F79480',
      },
    },
  },
  plugins: [],
}