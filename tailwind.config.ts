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
        display: ['var(--font-display)', 'cursive'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        black: '#020B18',
        dark: '#041020',
        surface: '#071428',
        card: '#0A1A32',
        'border-dark': '#0F2040',
        light: '#0D2244',
        'light-card': '#112952',
        green: '#00FF87',
        blue: '#0EA5E9',
        sky: '#38BDF8',
        white: '#F0F8FF',
        muted: '#6B8CAE',
        primary: {
          DEFAULT: '#00FF87',
          foreground: '#020B18',
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          foreground: '#F0F8FF',
        },
        accent: {
          DEFAULT: '#38BDF8',
          foreground: '#F0F8FF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
