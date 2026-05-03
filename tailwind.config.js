/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#fef3ee',
          100: '#fde4d4',
          200: '#fbc5a8',
          300: '#f89d72',
          400: '#f46a3a',
          500: '#f14718',
          600: '#e22d0e',
          700: '#bb200e',
          800: '#951b14',
          900: '#791a13',
          950: '#410908',
        },
      },
    },
  },
  plugins: [],
}
