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
      colors: {
        // Light palette
        'light-bg':      '#FFFFFF',
        'light-surface': '#F8FAFB',
        'light-card':    '#FFFFFF',
        'light-border':  '#E2E8F0',
        'light-text':    '#0A1628',
        'light-subtext': '#4A6380',
        'light-muted':   '#94A3B8',

        // Dark palette
        'dark-bg':       '#050E1A',
        'dark-surface':  '#081525',
        'dark-card':     '#0C1E35',
        'dark-border':   '#142440',
        'dark-text':     '#FFFFFF',
        'dark-subtext':  '#8BA4BE',
        'dark-muted':    '#4A6380',

        // Accents
        'green':         '#00C96B',
        'green-light':   '#00E87A',
        'green-dark':    '#00A356',
        'blue':          '#0582FF',
        'blue-light':    '#2E96FF',
        'cyan':          '#00D4FF',

        // Shadcn UI compat
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        'sm':   '8px',
        'md':   '14px',
        'lg':   '24px',
        'xl':   '32px',
        full:   '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(10,22,40,0.08)',
        'card': '0 1px 3px rgba(10,22,40,0.08), 0 8px 24px rgba(10,22,40,0.06)',
        'card-hover': '0 4px 12px rgba(10,22,40,0.12), 0 16px 40px rgba(10,22,40,0.1)',
        'green': '0 4px 20px rgba(0,201,107,0.25)',
        'blue': '0 4px 20px rgba(5,130,255,0.25)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
