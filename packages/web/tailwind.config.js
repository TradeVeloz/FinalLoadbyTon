/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071621',
          900: '#0A1E2B',
          800: '#0F2B3D',
          700: '#153B54',
          600: '#1E4E6D',
          500: '#2A6890',
          100: '#E4EFF7',
        },
        brand: {
          orange: '#E8742B',
          'orange-hover': '#D25F18',
          'orange-light': '#FDEEE4',
          teal: '#1A7A6A',
          'teal-light': '#E2F4F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(232, 116, 43, 0.35)',
        'glow-teal': '0 0 20px rgba(26, 122, 106, 0.35)',
        'premium': '0 10px 30px -5px rgba(15, 43, 61, 0.12), 0 4px 12px -2px rgba(15, 43, 61, 0.08)',
      }
    },
  },
  plugins: [],
}
