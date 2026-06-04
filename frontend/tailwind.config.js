/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899' },
        violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6' },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 8s ease-in-out 2s infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        'pulse-soft': { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scan: { '0%,100%': { top: '0%', opacity: '0.8' }, '50%': { top: '95%', opacity: '0.4' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
}

module.exports = {
  theme: {
    extend: {
      fontSize: {
        // 1.75× scale of Tailwind defaults
        'sm':  ['0.875rem', { lineHeight: '1.5rem' }],   // was 0.875
        'base':['1.75rem',  { lineHeight: '2.625rem' }], // was 1rem → ×1.75
        'lg':  ['1.969rem', { lineHeight: '3rem' }],     // was 1.125
        'xl':  ['2.188rem', { lineHeight: '3.25rem' }],  // was 1.25
        '2xl': ['2.625rem', { lineHeight: '3.75rem' }],  // was 1.5
        '3xl': ['3.281rem', { lineHeight: '4.375rem' }], // was 1.875
        '4xl': ['3.938rem', { lineHeight: '1.1' }],      // was 2.25
        // Hero title (h1) — leave 5xl/6xl untouched:
        '5xl': ['3rem',     { lineHeight: '1' }],        // ORIGINAL, no change
        '6xl': ['3.75rem',  { lineHeight: '1' }],        // ORIGINAL, no change
      }
    }
  }
}