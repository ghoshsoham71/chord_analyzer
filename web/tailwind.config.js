module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        accent: '#06b6d4'
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(15, 23, 42, 0.12)'
      }
    },
  },
  plugins: [],
}
