
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas-neue)', 'cursive'],
        body: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        black: '#050505',
        dark: '#0A0A0F',
        surface: '#111118',
        card: {
          DEFAULT: '#16161F',
          foreground: 'hsl(var(--card-foreground))',
        },
        'border-dark': '#1E1E2E',
        gold: '#FFD166',
        purple: '#A855F7',
        cyan: '#06B6D4',
        white: '#F8F8FF',
        muted: {
          DEFAULT: '#7B7B9A',
          foreground: 'hsl(var(--muted-foreground))',
        },
        primary: {
          DEFAULT: '#FFD166',
          foreground: '#050505',
        },
        secondary: {
          DEFAULT: '#A855F7',
          foreground: '#F8F8FF',
        },
        accent: {
          DEFAULT: '#06B6D4',
          foreground: '#F8F8FF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
