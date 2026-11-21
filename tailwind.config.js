/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'salu-navy': '#081C41',
        'salu-navy-deep': '#061534',
        'salu-orange': '#F97316',
        'salu-orange-hover': '#EA580C',
        'salu-blue': '#1D6FE5',
        'salu-blue-hover': '#1558B8',
        saluNavy: {
          DEFAULT: '#081C41',
          deep: '#061534',
        },
        saluOrange: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
        },
        saluBlue: {
          DEFAULT: '#1D6FE5',
          hover: '#1558B8',
        },
        // Paleta Cultural de Angola (do salu_(3).zip)
        terracotta: {
          DEFAULT: '#C43E19',
          50: '#FDF3EF',
          100: '#FCE3D8',
          200: '#F7C2AE',
          300: '#F19B7D',
          400: '#EB6D47',
          500: '#C43E19',
          600: '#A63213',
          700: '#85270F',
          800: '#67200F',
          900: '#4F1A0D',
        },
        savannah: {
          DEFAULT: '#2D4C39',
          50: '#F1F6F3',
          100: '#DCE9E1',
          200: '#BAD3C4',
          300: '#8FB59F',
          400: '#5D9175',
          500: '#2D4C39',
          600: '#233D2E',
          700: '#1B3024',
          800: '#15251C',
          900: '#0F1B14',
        },
        sunrise: {
          DEFAULT: '#FDB813',
          50: '#FFFBEB',
          100: '#FEF2C7',
          200: '#FDE48A',
          300: '#FDCF4D',
          400: '#FDB813',
          500: '#E59D09',
          600: '#BD7806',
          700: '#945608',
          800: '#78440E',
          900: '#63380F',
        },
        cassava: {
          DEFAULT: '#FAF2E6',
          surface: '#FFFDF9',
          muted: '#F5E8D5',
          border: '#E3CFB4',
          strong: '#D4B690',
        },
        acacia: {
          DEFAULT: '#120C08',
          surface: '#1C140E',
          elevated: '#271C14',
          border: '#3D2C1F',
          ink: '#FAF1E4',
          muted: '#CCBA9F',
        },

        // Legados (mantidos para total compatibilidade)
        sand: '#FAF2E6',
        paper: '#FFFDF9',
        'ink-soft': '#6E533E',
        mute: '#8A7360',
        line: '#E3CFB4',
        brand: {
          50: '#F1F6F3',
          100: '#DCE9E1',
          500: '#2D4C39',
          600: '#233D2E',
          700: '#1B3024',
        },
        forest: {
          50: '#F1F6F3',
          100: '#DCE9E1',
          500: '#2D4C39',
          600: '#233D2E',
          700: '#1B3024',
        },

        ink: {
          DEFAULT: '#1C120B',
          50: '#FAF2E6',
          100: '#F5E8D5',
          200: '#E3CFB4',
          300: '#CCBA9F',
          400: '#8A7360',
          500: '#5A4332',
          600: '#3D2C1F',
          700: '#271C14',
          800: '#1C140E',
          900: '#120C08',
        },
        green: {
          400: '#5D9175',
          500: '#2D4C39',
          600: '#233D2E',
          700: '#1B3024',
          900: '#0F1B14',
        },
        lime: {
          DEFAULT: '#FDB813',
          dark: '#E59D09',
        },
        terra: {
          DEFAULT: '#C43E19',
          dark: '#A63213',
        },
        amber: {
          DEFAULT: '#FDB813',
        },
        dark: {
          DEFAULT: '#120C08',
          100: '#1C140E',
          200: '#271C14',
          300: '#3D2C1F',
        },
      },

      fontFamily: {
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      borderColor: {
        DEFAULT: '#E3CFB4',
        highlight: '#FDB813',
        accent: '#C43E19',
      },

      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-up-delay': 'fade-up 0.5s ease-out 0.15s forwards',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        marquee: 'marquee 30s linear infinite',
      },

      boxShadow: {
        'salu-card': '0 1px 2px rgba(28, 18, 11, 0.05), 0 8px 24px -12px rgba(196, 62, 25, 0.12)',
        'salu-highlight': '0 0 0 2px rgba(253, 184, 19, 0.35)',
        'glow-green': '0 0 20px rgba(45, 76, 57, 0.35)',
        'glow-lime': '0 0 20px rgba(253, 184, 19, 0.3)',
        card: '0 4px 24px rgba(0,0,0,0.12)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.2)',
        suave: '0 1px 2px rgba(28, 18, 11, 0.06)',
        elevado: '0 4px 16px -4px rgba(28, 18, 11, 0.18)',
      },

      borderRadius: {
        cartao: '12px',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
