// tailwind.config.ts  –  drop this into the project root (merge with existing if present)
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
      // ── Brand colours ─────────────────────────────────────────────
      colors: {
        black:   '#020B18',
        dark:    '#041020',
        surface: '#071428',
        card:    '#0A1020',
        light:   '#0D1525',
        border:  '#0F2040',
        muted:   '#6B8CAE',
        white:   '#F0F8FF',

        green:   { DEFAULT: '#00FF87', dim: 'rgba(0,255,135,0.10)' },
        blue:    { DEFAULT: '#0EA5E9', dim: 'rgba(14,165,233,0.10)' },
        sky:     { DEFAULT: '#38BDF8', dim: 'rgba(56,189,248,0.10)' },
        gold:    { DEFAULT: '#FFD166', dim: 'rgba(255,209,102,0.10)' },
        purple:  { DEFAULT: '#A855F7', dim: 'rgba(168,85,247,0.10)' },
        cyan:    { DEFAULT: '#06B6D4', dim: 'rgba(6,182,212,0.10)' },
      },

      // ── Fonts ──────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      // ── Custom shadows (glow system) ──────────────────────────────
      boxShadow: {
        'glow-green':  '0 0 30px rgba(0,255,135,0.25)',
        'glow-gold':   '0 0 30px rgba(255,209,102,0.25)',
        'glow-purple': '0 0 30px rgba(168,85,247,0.25)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.25)',
        'glow-blue':   '0 0 30px rgba(14,165,233,0.25)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 12px 48px rgba(0,0,0,0.6)',
        'modal':       '0 24px 80px rgba(0,0,0,0.8)',
      },

      // ── Border radius ──────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── Spacing extras ─────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
        '100': '25rem',
        '120': '30rem',
      },

      // ── Z-index layers ─────────────────────────────────────────────
      zIndex: {
        '60':   '60',
        '70':   '70',
        '80':   '80',
        '90':   '90',
        '100':  '100',
        '9000': '9000',
      },

      // ── Keyframes & animations ─────────────────────────────────────
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
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,135,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(0,255,135,0.7)' },
        },
        scanline: {
          from: { transform: 'translateY(-100%)' },
          to:   { transform: 'translateY(100%)' },
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
        'shimmer':         'shimmer 2s linear infinite',
        'float':           'float 4s ease-in-out infinite',
        'fade-in-up':      'fadeInUp 0.5s ease-out both',
        'fade-in-down':    'fadeInDown 0.5s ease-out both',
        'fade-in':         'fadeIn 0.4s ease-out both',
        'scale-in':        'scaleIn 0.3s ease-out both',
        'pulse-glow':      'pulseGlow 2s ease-in-out infinite',
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
      },

      // ── Background images ──────────────────────────────────────────
      backgroundImage: {
        'grid-dark':  'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        'grid-light': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'gradient-brand': 'linear-gradient(135deg, #FFD166, #A855F7)',
        'gradient-green-blue': 'linear-gradient(135deg, #00FF87, #0EA5E9)',
      },

      // ── Background size ────────────────────────────────────────────
      backgroundSize: {
        'grid-sm': '40px 40px',
        'grid-md': '60px 60px',
        'grid-lg': '80px 80px',
      },

      // ── Transition timing ──────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      // ── Aspect ratios ──────────────────────────────────────────────
      aspectRatio: {
        'portrait':  '3 / 4',
        'landscape': '16 / 9',
        'square':    '1 / 1',
        'card':      '4 / 3',
      },
    },
  },

  plugins: [
    // Scrollbar hide utility
    ({ addUtilities }: any) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#00FF87 #041020',
        },
        // Text clamp utilities
        '.line-clamp-1': { overflow: 'hidden', display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '1' },
        '.line-clamp-2': { overflow: 'hidden', display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '2' },
        '.line-clamp-3': { overflow: 'hidden', display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '3' },
        // Neon glow text helpers
        '.text-glow-green':  { textShadow: '0 0 40px rgba(0,255,135,0.55)' },
        '.text-glow-gold':   { textShadow: '0 0 40px rgba(255,209,102,0.55)' },
        '.text-glow-purple': { textShadow: '0 0 40px rgba(168,85,247,0.55)' },
        '.text-glow-cyan':   { textShadow: '0 0 40px rgba(6,182,212,0.55)' },
        '.text-glow-blue':   { textShadow: '0 0 40px rgba(14,165,233,0.55)' },
        // Glass utility
        '.glass': {
          background: 'rgba(4,16,32,0.55)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(14,165,233,0.12)',
        },
        // Scan lines overlay
        '.scanlines': {
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        },
      });
    },
  ],
};

export default config;
