/**
 * Tailwind is wired to the single source of truth for design tokens:
 * `src/styles/_tokens.scss`, which publishes every colour as an
 * `--rgb-*` triplet so Tailwind opacity modifiers keep working
 * (e.g. `bg-primary/10`) and dark mode is a pure variable swap.
 */

/** Builds a Tailwind colour that reads a CSS variable and supports `/opacity`. */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/context/**/*.{js,jsx}',
    './src/theme/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: withOpacity('--rgb-primary'),
          light: withOpacity('--rgb-primary-light'),
          dark: withOpacity('--rgb-primary-dark'),
          contrast: withOpacity('--rgb-primary-contrast'),
        },
        secondary: {
          DEFAULT: withOpacity('--rgb-secondary'),
          light: withOpacity('--rgb-secondary-light'),
          dark: withOpacity('--rgb-secondary-dark'),
        },
        gold: {
          DEFAULT: withOpacity('--rgb-gold'),
          light: withOpacity('--rgb-gold-light'),
          dark: withOpacity('--rgb-gold-dark'),
        },
        accent: {
          DEFAULT: withOpacity('--rgb-accent'),
          light: withOpacity('--rgb-accent-light'),
        },
        success: withOpacity('--rgb-success'),
        warning: withOpacity('--rgb-warning'),
        danger: withOpacity('--rgb-danger'),
        info: withOpacity('--rgb-info'),

        canvas: withOpacity('--rgb-canvas'),
        surface: {
          DEFAULT: withOpacity('--rgb-surface'),
          muted: withOpacity('--rgb-surface-muted'),
          raised: withOpacity('--rgb-surface-raised'),
        },
        line: withOpacity('--rgb-border'),
        content: {
          DEFAULT: withOpacity('--rgb-text'),
          muted: withOpacity('--rgb-text-muted'),
          subtle: withOpacity('--rgb-text-subtle'),
          inverse: withOpacity('--rgb-text-inverse'),
        },
      },
      fontFamily: {
        sans: ['var(--font-family-base)'],
        display: ['var(--font-family-display)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        'display-lg': ['var(--font-size-display-lg)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display': ['var(--font-size-display)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['var(--font-size-h1)', { lineHeight: '1.15' }],
        h2: ['var(--font-size-h2)', { lineHeight: '1.2' }],
        h3: ['var(--font-size-h3)', { lineHeight: '1.3' }],
        h4: ['var(--font-size-h4)', { lineHeight: '1.35' }],
        body: ['var(--font-size-body)', { lineHeight: '1.65' }],
        sm: ['var(--font-size-sm)', { lineHeight: '1.55' }],
        xs: ['var(--font-size-xs)', { lineHeight: '1.5' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      spacing: {
        section: 'var(--space-section)',
      },
      maxWidth: {
        prose: '68ch',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s var(--ease-smooth) both',
        'fade-in': 'fade-in 0.4s var(--ease-smooth) both',
        'scale-in': 'scale-in 0.3s var(--ease-smooth) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // MUI ships its own baseline; Tailwind preflight stays on because the
    // app never renders MUI's CssBaseline (see src/theme/ThemeRegistry.jsx).
    preflight: true,
  },
};
