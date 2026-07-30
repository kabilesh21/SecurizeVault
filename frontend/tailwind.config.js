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
        white: '#F5E6D3', // Theme Sandalwood Base Color for cards
        indigo: {
          50: '#fdf9fb',
          100: '#f6ebf0',
          200: '#ecd7e1',
          300: '#dbaec3',
          400: '#c585a2',
          500: '#a37085',
          600: '#8c5b70', // Muted Mulberry
          650: '#7c4d61',
          700: '#6d4352',
          800: '#54313f',
          900: '#3e212d',
        },
        sky: {
          50: '#FCF8F2',
          100: '#F7EFE3',
          205: '#EEDCBF',
          300: '#E1C497',
          400: '#D0A770',
          500: '#B8864B', // Sandalwood Tan Primary Accent
          600: '#9C6E39',
          700: '#7E5529',
          800: '#613E1B',
          900: '#422910',
        },
        emerald: {
          50: '#FCF8F2',
          100: '#F7EFE3',
          500: '#B8864B',
          600: '#9C6E39',
          700: '#7E5529',
        },
        slate: {
          50: '#FAF5EE', // Warm cream backdrop
          100: '#E5D3BC', // Warm Sandalwood border
          150: '#D8C3A5',
          200: '#C7AF8F',
          250: '#B69C7A',
          300: '#A68864',
          400: '#95754F',
          500: '#84623A',
          600: '#744F26',
          700: '#5F3D18',
          800: '#4C300F',
          850: '#39220A',
          900: '#261505',
          950: '#180B02',
        },
        orange: {
          50: '#fffcf9',
          100: '#fdf2e8',
          500: '#f5c29b', // Soft Apricot
          600: '#e4ac82',
          700: '#c88c5f',
        },
        amber: {
          50: '#fffcf9',
          100: '#fdf2e8',
          500: '#f5c29b', // Soft Apricot
          600: '#e4ac82',
          700: '#c88c5f',
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
