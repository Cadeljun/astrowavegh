import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg:       '#FFFFFF',
        'bg-soft': '#F4FBF7',
        'bg-muted': '#EAF5EF',
        surface:  '#FFFFFF',
        card:     '#FFFFFF',
        border:   '#D1E8DA',

        // Primary — Green
        green: {
          DEFAULT: '#00C853',
          light:   '#00FF87',
          dark:    '#007A33',
          dim:     'rgba(0,200,83,0.10)',
        },

        // Secondary — Blue
        blue: {
          DEFAULT: '#0EA5E9',
          light:   '#38BDF8',
          dark:    '#0369A1',
          dim:     'rgba(14,165,233,0.10)',
        },

        // Text
        text:       '#0A1A10',
        'text-soft': '#2D4A38',
        muted:      '#5A7A65',

        // Legacy aliases (used in existing pages)
        black:   '#0A1A10',
        dark:    '#132A1A',
        gold:    '#00C853',
        purple:  '#0EA5E9',
        cyan:    '#38BDF8',
        white:   '#FFFFFF',
      },

      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      boxShadow: {
        'glow-green': '0 0 30px rgba(0,200,83,0.25)',
        'glow-blue':  '0 0 30px rgba(14,165,233,0.25)',
        'card':       '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
        'modal':      '0 24px 80px rgba(0,0,0,0.15)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },

      zIndex: {
        '60': '60', '70': '70', '80': '80', '9000': '9000',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },

      animation: {
        'shimmer':        'shimmer 2s linear infinite',
        'float':          'float 4s ease-in-out infinite',
        'fade-in-up':     'fadeInUp 0.5s ease-out both',
        'scale-in':       'scaleIn 0.3s ease-out both',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },

      backgroundImage: {
        'grid-light': 'linear-gradient(rgba(0,200,83,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.05) 1px, transparent 1px)',
        'grid-blue':  'linear-gradient(rgba(14,165,233,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.05) 1px, transparent 1px)',
        'gradient-brand': 'linear-gradient(135deg, #00C853, #0EA5E9)',
      },

      backgroundSize: {
        'grid-md': '60px 60px',
      },

      transitionTimingFunction: {
        'spring':      'cubic-bezier(0.22, 1, 0.36, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },

  plugins: [
    ({ addUtilities }: any) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.text-glow-green': { textShadow: '0 0 30px rgba(0,200,83,0.4)' },
        '.text-glow-blue':  { textShadow: '0 0 30px rgba(14,165,233,0.4)' },
        '.glass': {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(0,200,83,0.15)',
        },
      });
    },
  ],
};

export default config;
