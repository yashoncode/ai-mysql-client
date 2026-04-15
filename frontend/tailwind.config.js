/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'antares': {
          'bg': '#1d1d1d',
          'sidebar': '#272727',
          'surface': '#2b2b2b',
          'border': '#3f3f3f',
          'hover': '#333333',
          'accent': '#e36929',
          'accent-dark': '#c4551e',
          'text': '#cccccc',
          'text-dim': '#888888',
          'text-bright': '#ffffff',
          'success': '#32b643',
          'error': '#de3b28',
          'warning': '#e0a40c',
          'info': '#5755d9',
        },
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      spacing: {
        '14r': '14rem',
        '3.5r': '3.5rem',
      },
    },
  },
  plugins: [],
}
