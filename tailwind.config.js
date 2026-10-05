/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#EEF5FF', 100: '#D9E9FF', 200: '#BCD8FF', 300: '#8EC0FF', 400: '#599DFF',
          500: '#3379FF', 600: '#1A5CF5', 700: '#1448E1', 800: '#173CB6', 900: '#19388F',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 1px rgba(16,24,40,0.02)',
        'card-hover': '0 12px 32px -12px rgba(16,24,40,0.18), 0 2px 6px rgba(16,24,40,0.05)',
        pop: '0 16px 48px -12px rgba(16,24,40,0.25), 0 0 0 1px rgba(16,24,40,0.06)',
        phone: '0 50px 100px -30px rgba(16,24,40,0.45), 0 30px 60px -40px rgba(16,24,40,0.5)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        'phone-in': { '0%': { opacity: 0, transform: 'translateY(24px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
        'draw': { '0%': { strokeDashoffset: 48 }, '100%': { strokeDashoffset: 0 } },
        'ring': { '0%': { transform: 'scale(.6)', opacity: 0.5 }, '100%': { transform: 'scale(1.6)', opacity: 0 } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .3s ease both',
        'scale-in': 'scale-in .18s cubic-bezier(.2,.7,.2,1) both',
        'phone-in': 'phone-in .7s cubic-bezier(.2,.7,.2,1) both',
        draw: 'draw .5s .25s cubic-bezier(.65,0,.35,1) both',
        ring: 'ring 1.6s cubic-bezier(.2,.7,.2,1) infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
