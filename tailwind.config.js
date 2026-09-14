/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0c3a59',
        },
        dark: {
          bg: '#0b0f19',
          card: '#111827',
          border: '#1f2937',
          hover: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
