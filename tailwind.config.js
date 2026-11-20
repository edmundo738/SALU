/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14120F',
        sand: '#F7F3EC',
        paper: '#FFFFFF',
        line: '#E4DCD0',
        mute: '#6B6257',
        brand: {
          50: '#FDF6E9',
          100: '#F8E7C4',
          500: '#D89B2C',
          600: '#B87D18',
          700: '#8E5F10',
        },
        forest: {
          500: '#1F6B4F',
          600: '#175540',
          700: '#113F30',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
