/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kathal: {
          50:  '#fdf4f3',
          100: '#fce7e4',
          200: '#fad3cd',
          300: '#f5b4a9',
          400: '#ed8978',
          500: '#e0644d',
          600: '#cc482e',
          700: '#ab3822',
          800: '#8d3120',
          900: '#762d22',
          950: '#40130d',
        },
      },
    },
  },
  plugins: [],
}
