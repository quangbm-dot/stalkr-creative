/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
    screens: {
      sm: '640px', // small
      md: '768px', // medium
      lg: '1024px', // large
      xl: '1280px', // extra large
    }
  },
  plugins: [],
} 