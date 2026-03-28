import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ─── Colors ──────────────────────────────────────────
      colors: {
        // Brand — configurable per gym via CSS vars
        primary: {
          DEFAULT: 'var(--color-primary, #2563EB)',
          dark: 'var(--color-primary-dark, #1E40AF)',
        },

        // Page & Surface
        page: '#F9F9F8',
        surface: '#FFFFFF',
        'stat-card': '#F5F5F4',

        // Sidebar
        sidebar: {
          DEFAULT: '#111111',
          'active-bg': 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.06)',
          text: '#FFFFFF',
          muted: '#6B7280',
          'section-label': '#4B5563',
          'border-bottom': 'rgba(255, 255, 255, 0.08)',
        },

        // Text
        'text-primary': '#0A0A0A',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'text-placeholder': '#9CA3AF',

        // Borders
        'border-default': '#EBEBEB',
        'border-strong': '#D1D5DB',
        divider: '#F3F4F6',

        // Status — Success
        success: {
          DEFAULT: '#16A34A',
          bg: '#F0FDF4',
          border: '#BBF7D0',
        },

        // Status — Warning
        warning: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
        },

        // Status — Danger
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          'hover-bg': '#FEE2E2',
        },

        // Status — Info
        info: {
          DEFAULT: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        },

        // Badge-specific
        'fee-due': { DEFAULT: '#EA580C', bg: '#FFF7ED' },
        coach: { DEFAULT: '#2563EB', bg: '#EFF6FF' },
        receptionist: { DEFAULT: '#7C3AED', bg: '#F5F3FF' },

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.3)',
        'overlay-modal': 'rgba(0, 0, 0, 0.4)',
      },

      // ─── Typography ──────────────────────────────────────
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'page-title': ['24px', { lineHeight: '1.2', fontWeight: '500' }],
        'section-heading': ['18px', { lineHeight: '1.2', fontWeight: '500' }],
        'card-heading': ['15px', { lineHeight: '1.2', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'table-row': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.6', fontWeight: '400' }],
        'badge': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['11px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
        'stat-value': ['28px', { lineHeight: '1.2', fontWeight: '500' }],
        'section-label': ['11px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.08em' }],
      },

      // ─── Spacing (4px base grid) ─────────────────────────
      spacing: {
        'xxs': '4px',    // xs in spec
        'card-pad': '24px',
        'page-h': '32px',
        'page-top': '48px',
        'between-cards': '16px',
        'between-sections': '32px',
        'sidebar-item-h': '44px',
        'sidebar-item-px': '12px',
        'sidebar-w': '240px',
        'topbar-h': '56px',
        'sidebar-logo-h': '56px',
        'drawer-pad': '24px',
      },

      // ─── Sizing ──────────────────────────────────────────
      width: {
        sidebar: '240px',
        drawer: '480px',
        toast: '340px',
        modal: '400px',
      },

      height: {
        btn: '36px',
        input: '40px',
        'table-header': '40px',
        'table-row': '52px',
        'sidebar-item': '44px',
        topbar: '56px',
        'sidebar-logo': '56px',
      },

      maxWidth: {
        modal: '400px',
        drawer: '480px',
        toast: '340px',
      },

      // ─── Border Radius ───────────────────────────────────
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '8px',
        badge: '999px',
        modal: '16px',
        toast: '10px',
        'stat-card': '12px',
      },

      // ─── Shadows ─────────────────────────────────────────
      boxShadow: {
        'card-hover': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },

      // ─── Transitions ─────────────────────────────────────
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'skeleton': '200ms',
        'drawer': '220ms',
        'modal': '180ms',
        'toast-in': '200ms',
        'toast-out': '300ms',
        'stat': '600ms',
      },

      transitionTimingFunction: {
        'drawer': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Animations ──────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'toast-in': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-out': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(16px)', opacity: '0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },

      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 200ms ease forwards',
        'fade-in-up': 'fade-in-up 300ms ease forwards',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-out-right': 'slide-out-right 220ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scale-in 180ms ease forwards',
        'toast-in': 'toast-in 200ms ease forwards',
        'toast-out': 'toast-out 300ms ease forwards',
        'count-up': 'count-up 600ms ease forwards',
        'overlay-in': 'overlay-in 220ms ease forwards',
      },

      // ─── Backdrop Blur ───────────────────────────────────
      backdropBlur: {
        modal: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
