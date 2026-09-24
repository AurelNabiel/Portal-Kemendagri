/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Biru pemerintahan (warna utama)
        navy: {
          50: '#EEF3FA',
          100: '#D6E2F2',
          200: '#AFC5E4',
          300: '#7FA0D0',
          400: '#4F79B6',
          500: '#2E5B9A',
          600: '#1F477F',
          700: '#173866',
          800: '#102A4E',
          900: '#0A1D38',
          950: '#06132A',
        },
        // Coklat cerah (aksen)
        tan: {
          50: '#FBF7F0',
          100: '#F4EADA',
          200: '#E8D4B4',
          300: '#D9B98A',
          400: '#C9A064',
          500: '#B7894A',
          600: '#9A6F38',
          700: '#7A572D',
          800: '#5B4123',
          900: '#3E2C18',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(0.22,1,0.36,1) infinite',
      },
    },
  },
  plugins: [],
};
