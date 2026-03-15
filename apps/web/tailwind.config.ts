import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #2563EB)',
          dark: 'var(--color-primary-dark, #1E40AF)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #1E40AF)',
        },
        surface: '#FFFFFF',
        page: '#F9F9F8',
        border: '#E5E5E5',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
