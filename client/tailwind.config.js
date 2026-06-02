/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0f1117',
          700: '#151821',
          600: '#1c2030',
          500: '#242840',
        },
        brand: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
};
