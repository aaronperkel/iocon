import type { Config } from 'tailwindcss'

// Every color below resolves to a CSS variable defined in app/globals.css,
// where each has a light value and (where the dark theme differs) a dark
// override under prefers-color-scheme. That one file rethemes the whole site —
// no per-component dark: classes needed. Variables hold space-separated RGB
// so Tailwind opacity modifiers (bg-white/90, ring-stone-900/30) still work.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

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
        cream: v('cream'),
        white: v('white'),
        // Brand palette — Riley's colors (design/color-codes.txt) anchored at 500.
        // Light/dark shades are derived; 700+ are darkened for text contrast on white.
        gold: {
          DEFAULT: v('gold-500'),
          50: v('gold-50'),
          100: v('gold-100'),
          200: v('gold-200'),
          300: v('gold-300'),
          400: v('gold-400'),
          500: v('gold-500'),
          600: v('gold-600'),
          700: v('gold-700'),
          800: v('gold-800'),
          900: v('gold-900'),
          950: v('gold-950'),
        },
        olive: {
          DEFAULT: v('olive-500'),
          25: v('olive-25'), // page background — almost-white olive tint (Riley)
          50: v('olive-50'),
          100: v('olive-100'),
          200: v('olive-200'),
          300: v('olive-300'),
          400: v('olive-400'),
          500: v('olive-500'),
          600: v('olive-600'),
          700: v('olive-700'),
          800: v('olive-800'),
          900: v('olive-900'),
          950: v('olive-950'),
        },
        // Neutrals mirror Tailwind's stone scale in light mode and invert
        // around the midpoint in dark mode (text lightens, washes darken).
        stone: {
          50: v('stone-50'),
          100: v('stone-100'),
          200: v('stone-200'),
          300: v('stone-300'),
          400: v('stone-400'),
          500: v('stone-500'),
          600: v('stone-600'),
          700: v('stone-700'),
          800: v('stone-800'),
          900: v('stone-900'),
          950: v('stone-950'),
        },
        // Only the red shades the forms use; other reds stay Tailwind defaults.
        red: {
          400: v('red-400'),
          600: v('red-600'),
        },
      },
    },
  },
  plugins: [],
}

export default config
