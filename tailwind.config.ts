import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta alinhada à identidade LAMELP-PB usada na tela de login
        // (verde-floresta escuro como cor primária, com um scale completo
        // para os diferentes usos: fundos claros, texto, botões, hover).
        brand: {
          50: '#EEF5F1',
          100: '#DCEAE1',
          200: '#B9D5C4',
          300: '#8FB9A0',
          400: '#5E9678',
          500: '#3D7657',
          600: '#245A3D',
          700: '#123526',
          800: '#0D2A1D',
          900: '#081C14',
        },
        brass: {
          50: '#FBF7EF',
          100: '#F3E9D3',
          300: '#D9BE8C',
          500: '#B08D57',
          700: '#8A6B3E',
        },
        surface: '#F7F3EC',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
