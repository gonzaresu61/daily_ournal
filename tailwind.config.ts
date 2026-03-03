import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        accent: '#007AFF',
        danger: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
      },
      backdropBlur: {
        glass: '24px',
      },
      animation: {
        'blob-1': 'blob1 14s ease-in-out infinite alternate',
        'blob-2': 'blob2 10s ease-in-out infinite alternate',
        'blob-3': 'blob3 16s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        blob1: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(30px,-40px) scale(1.08)' },
        },
        blob2: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(-20px,30px) scale(1.05)' },
        },
        blob3: {
          '0%': { transform: 'translate(-50%,-50%) scale(1)' },
          '100%': { transform: 'translate(-50%,-50%) scale(1.1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
