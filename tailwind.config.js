/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vietnam-red': '#23473d',
        // Map the default 'red' palette to the new brand color so Tailwind
        // utilities like bg-red-500, text-red-600, etc. use the desired color.
        red: {
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
        'vietnam-green': '#6B8E23',
      },
      fontFamily: {
        'serif': ['Noto Serif', 'serif'],
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
