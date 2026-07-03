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
        // ── Light backgrounds
        bg:          '#FFFFFF',
        'bg-soft':   '#F0FAF5',
        'bg-muted':  '#E6F4ED',

        // ── Green (primary)
        green: {
          DEFAULT: '#00C853',
          light:   '#5FFFAC',
          dark:    '#007A33',
        },

        // ── Blue (secondary)
        blue: {
          DEFAULT: '#0EA5E9',
          light:   '#38BDF8',
          dark:    '#0369A1',
        },

        // ── Text
        text:        '#0B1F14',
        'text-soft': '#2A4434',
        muted:       '#567060',

        // ── Borders
        border:      '#C8E6D4',

        // ── Dark-theme (hero overlays, nav over photos)
        'dark-bg':      '#0B1F14',
        'dark-surface': '#122819',
        'dark-card':    '#162E1C',
        'dark-border':  'rgba(0,200,83,0.15)',
        'dark-text':    '#F0FAF5',
        'dark-subtext': 'rgba(240,250,245,0.65)',
        'dark-muted':   'rgba(240,250,245,0.35)',

        // ── Legacy aliases (keeps old pages compiling)
        black:   '#0B1F14',
        dark:    '#122819',
        surface: '#FFFFFF',
        card:    '#FFFFFF',
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
        'glow-green': '0 0 30px rgba(0,200,83,0.28)',
        'glow-blue':  '0 0 30px rgba(14,165,233,0.28)',
        'card':       '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
        'modal':      '0 24px 80px rgba(0,0,0,0.14)',
        'gold':       '0 0 20px rgba(0,200,83,0.30)',
        'blue':       '0 0 20px rgba(14,165,233,0.30)',
      },

      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },

      spacing: {
        '18': '4.5rem', '22': '5.5rem', '30': '7.5rem', '34': '8.5rem',
      },

      zIndex: { '60': '60', '70': '70', '9000': '9000' },

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
        'gradient-brand': 'linear-gradient(135deg, #00C853, #0EA5E9)',
        'gradient-green': 'linear-gradient(135deg, #00C853, #5FFFAC)',
        'grid-light': 'linear-gradient(rgba(0,200,83,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.06) 1px, transparent 1px)',
      },

      backgroundSize: { 'grid-md': '60px 60px' },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
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
        '.text-glow-green': { textShadow: '0 0 30px rgba(0,200,83,0.45)' },
        '.text-glow-blue':  { textShadow: '0 0 30px rgba(14,165,233,0.45)' },
        '.glass': {
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(0,200,83,0.15)',
        },
      });
    },
  ],
};

export default config;
