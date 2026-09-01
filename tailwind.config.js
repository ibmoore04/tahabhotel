/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#051814',
          900: '#0B2B26',
          850: '#0F3832',
          800: '#163E36',
          700: '#1F5248',
          600: '#2C6E61',
        },
        gold: {
          100: '#FAF4E1',
          200: '#F5E8C3',
          300: '#EBD28B',
          400: '#DFC05D',
          500: '#D4AF37', // Brand Luxury Gold
          600: '#C5A059',
          700: '#9E7D2B',
          800: '#755B1B',
        },
        charcoal: {
          950: '#0A0A0A',
          900: '#121212',
          850: '#181818',
          800: '#222222',
          700: '#333333',
        },
        warm: {
          50: '#FDFCFA',
          100: '#FBFBF9',
          200: '#F7F5F0',
          300: '#EFECE4',
          400: '#E3DFD4',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 2px 10px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 4px 20px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 10px 30px rgba(212, 175, 55, 0.3)',
        'luxury': '0 20px 40px -15px rgba(5, 24, 20, 0.4)',
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #0B2B26 0%, #051814 100%)',
        'gold-gradient': 'linear-gradient(135deg, #DFBF59 0%, #C5A059 50%, #9E7D2B 100%)',
        'dark-overlay': 'linear-gradient(to bottom, rgba(11,43,38,0.7) 0%, rgba(5,24,20,0.95) 100%)',
      },
    },
  },
  plugins: [],
};
