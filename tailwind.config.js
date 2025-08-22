export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          islamic: {
            green: '#006633',
            gold: '#D4AF37',
            darkgreen: '#004d26',
          }
        },
        fontFamily: {
          arabic: ['Amiri', 'serif'],
        }
      },
    },
    plugins: [],
  }