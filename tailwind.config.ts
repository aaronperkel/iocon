import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-uncial)', 'Georgia', 'serif'],
      },
      colors: {
        cream: '#FDFAF6',
        // Brand palette — Riley's colors (design/color-codes.txt) anchored at 500.
        // Light/dark shades are derived; 700+ are darkened for text contrast on white.
        gold: {
          DEFAULT: '#FFB101',
          50: '#FFF8E6',
          100: '#FFEFC2',
          200: '#FFE18A',
          300: '#FFD04D',
          400: '#FFC021',
          500: '#FFB101',
          600: '#C68A00',
          700: '#8F6400',
          800: '#705000',
          900: '#513A00',
          950: '#362600',
        },
        olive: {
          DEFAULT: '#ACAB00',
          50: '#FAFAEB',
          100: '#F2F2CE',
          200: '#E5E59B',
          300: '#D1D05C',
          400: '#BEBD26',
          500: '#ACAB00',
          600: '#8B8A00',
          700: '#6E6D00',
          800: '#4F5306',
          900: '#3C4207',
          950: '#232805',
        },
      },
    },
  },
  plugins: [],
}

export default config
