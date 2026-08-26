/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF', // Clean White Cards
        indigo: {
          50: '#F0FAF9',
          100: '#E0F5F3',
          200: '#DDF4F1', // Secondary color
          300: '#B0E6E2',
          400: '#80D7D3',
          500: '#3AAFAA', // Primary color
          600: '#3AAFAA', // Primary color
          650: '#2C9691',
          700: '#237F7B', // Dark Primary
          800: '#1A6360',
          900: '#114240',
        },
        sky: {
          50: '#F0FAF9',
          100: '#E0F5F3',
          205: '#DDF4F1',
          300: '#B0E6E2',
          400: '#80D7D3',
          500: '#3AAFAA', 
          600: '#2C9691',
          700: '#237F7B',
          800: '#1A6360',
          900: '#114240',
        },
        emerald: {
          50: '#F0FAF9',
          100: '#E0F5F3',
          500: '#3AAFAA',
          600: '#2C9691',
          700: '#237F7B',
        },
        slate: {
          50: '#F4F9F9', // Background color
          100: '#E6F0F0',
          150: '#DBEBEB',
          200: '#D2E3E3',
          250: '#BDD5D5',
          300: '#AEC8C8',
          400: '#7DA1A1',
          500: '#4B7171',
          600: '#284B4B',
          700: '#1A3B3B',
          800: '#123047', // Text color
          850: '#123047', // Text color
          900: '#0C2233',
          950: '#071521',
        },
        orange: {
          50: '#FFFDF9',
          100: '#FFF6E6',
          500: '#F6C176', 
          600: '#DEA354',
          700: '#B37D35',
        },
        amber: {
          50: '#FFFDF9',
          100: '#FFF6E6',
          500: '#F6C176',
          600: '#DEA354',
          700: '#B37D35',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
