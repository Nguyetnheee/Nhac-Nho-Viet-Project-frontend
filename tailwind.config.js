/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vietnam-green': '#23473d',
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
