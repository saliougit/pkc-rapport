/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vert: {
          principal: '#16824E',
          fonce: '#014421',
          pastel: '#E8F5E9',
          clair: '#8CD2B4'
        },
        orange: {
          strat: '#E67E22',
          pastel: '#FCF3E6'
        },
        rouge: {
          alerte: '#C0392B',
          pastel: '#FDE6E4'
        },
        bleu: {
          info: '#34495E',
          pastel: '#E8EEF5'
        },
        gris: {
          clair: '#F5F5F5',
          texte: '#404040'
        }
      }
    },
  },
  plugins: [],
}
