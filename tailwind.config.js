/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14110D',
        'ink-soft': '#3B352C',
        mute: '#7C7365',
        sand: '#F6F1E6',
        paper: '#FFFCF5',
        line: '#E4DACA',

        // Argila e ocre: as cores do barro e do sol, não as da bandeira.
        brand: {
          50: '#FBF3DC',
          100: '#F3DFD6',
          500: '#E9A70C',
          600: '#C1502E',
          700: '#8F3A1E',
        },

        // Verde musgo: usado só para contacto e confirmação.
        forest: {
          50: '#E6EFE9',
          100: '#D6E6DC',
          500: '#3C7059',
          600: '#2F5D46',
          700: '#244736',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        suave: '0 1px 2px rgba(20,17,13,.05), 0 14px 34px -20px rgba(20,17,13,.4)',
        elevado: '0 2px 4px rgba(20,17,13,.06), 0 30px 60px -30px rgba(20,17,13,.5)',
      },
      borderRadius: {
        cartao: '16px',
      },
    },
  },
  plugins: [],
};
