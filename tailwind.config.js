/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FB923C',      // Orange-400
        secondary: '#FFE5CC',    // Light Orange
        accent: '#FFB6C1',       // Light Pink
        background: '#FFF5EE',   // Seashell
        text: '#333333',         // Dark Gray
        success: '#22C55E',      // Green-500
        warning: '#FBBF24',      // Yellow-400
        error: '#EF4444',        // Red-500
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

