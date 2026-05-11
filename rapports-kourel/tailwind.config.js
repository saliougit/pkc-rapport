/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // === Palette de marque (valeurs directes — composants existants) ===
        surface: '#F5F3EE',
        vert: {
          50:  '#EEF8F3',
          100: '#D6EEE4',
          200: '#A8D8C0',
          400: '#3BAD72',
          600: '#16824E',
          700: '#016A3B',
          800: '#014421',
          900: '#012E17',
          // Legacy aliases
          principal: '#16824E',
          fonce:     '#014421',
          pastel:    '#E8F5E9',
          clair:     '#8CD2B4',
        },
        gris: {
          50:  '#F8FAF9',
          100: '#F0F2F0',
          200: '#DDE3DF',
          300: '#BAC3BD',
          500: '#6B7A71',
          700: '#3D4A42',
          950: '#111714',
          // Legacy aliases
          clair: '#F5F5F5',
          texte: '#404040',
        },
        orange: {
          DEFAULT: '#D97706',
          bg:      '#FEF3C7',
          strat:   '#E67E22',
          pastel:  '#FCF3E6',
        },
        rouge: {
          DEFAULT: '#B91C1C',
          bg:      '#FEE2E2',
          alerte:  '#C0392B',
          pastel:  '#FDE6E4',
        },
        bleu: {
          DEFAULT: '#2563EB',
          bg:      '#EFF6FF',
          info:    '#34495E',
          pastel:  '#E8EEF5',
        },

        // === Système shadcn/ui (CSS variables HSL) ===
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
  plugins: [],
}
