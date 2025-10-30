/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vietnam-green': '#23473d',

        green: {
          50: '#23473d',
          100: '#23473d',
          200: '#23473d',
          300: '#23473d',
          400: '#23473d',
          500: '#23473d',
          600: '#23473d',
          700: '#23473d',
          800: '#23473d',
          900: '#23473d',
        },
        'vietnam-gold': '#DAA520',
        'vietnam-cream': '#FAF9F6',
      },
      fontFamily: {
        'serif': ['Noto Serif', 'serif'],
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
