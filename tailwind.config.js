/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-dark': '#060919',
        primary: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
        },
        muted: '#9CA3AF',
      },
      borderRadius: {
        /** Inputs, buttons, small controls — modern, not pillowy */
        control: '6px',
        /** Cards, menus, modals, tables */
        surface: '8px',
        /** Badges, filter chips */
        chip: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cta: '0px 5px 1rem rgba(13, 148, 136, 0.28)',
        glow: '0 0 60px rgba(13, 148, 136, 0.18)',
        card: '0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
