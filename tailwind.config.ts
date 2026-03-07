import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#2563EB",
        "primary-dark": "#1E40AF",
        "primary-light": "#EFF6FF",
        "secondary": "#0D9488",
        "accent-coral": "#FB7185",
        "accent-teal": "#2DD4BF",
        "accent-yellow": "#FACC15",
        "background-light": "#F3F4F6",
        "surface-light": "#ffffff",
        "text-main": "#111827",
        "text-muted": "#6B7280",
        "border-light": "#E5E7EB"
      },
      fontFamily: {
        // System font stack as fallback to prevent OS-level font differences
        "display": [
          "Manrope",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        // Sans font uses the same stack for consistency
        "sans": [
          "Manrope",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      // Responsive typography scale
      fontSize: {
        // Mobile-first responsive sizes with consistent line-height and letter-spacing
        "xs": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.005em" }],
        "base": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0em" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.005em" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.035em" }],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "24px",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(37, 99, 235, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cardEntrance: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        modalShake: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.95)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.02)' },
          '70%': { transform: 'translate(-50%, -50%) scale(0.98)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-out',
        fadeOut: 'fadeOut 150ms ease-in',
        scaleIn: 'scaleIn 150ms ease-out',
        slideInRight: 'slideInRight 300ms ease-out',
        slideOutRight: 'slideOutRight 300ms ease-in',
        slideInUp: 'slideInUp 400ms ease-out',
        cardEntrance: 'cardEntrance 400ms ease-out',
        shake: 'shake 400ms ease-in-out',
        modalShake: 'modalShake 300ms ease-out',
        float: 'float 4s ease-in-out infinite',
        blob: 'blob 7s infinite',
      },
    },
  },
  plugins: [],
}

export default config
