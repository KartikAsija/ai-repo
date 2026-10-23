/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#0B1220',
          card: '#111C33',
          surface: '#17243B',
          text: '#F8FAFC',
          muted: '#CBD5E1',
          accent: '#38BDF8',
          primary: '#0F766E',
          'primary-hover': '#115E59',
          'primary-active': '#134E4A',
          border: '#334155',
        },
        slate: {
          950: '#0B1220', // Main background
          900: '#111C33', // Cards and panels
          850: '#142038',
          800: '#17243B', // Secondary surfaces
          700: '#334155', // Borders
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1', // Secondary text
          200: '#E2E8F0',
          100: '#F8FAFC', // Primary text
          50: '#FFFFFF',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(120deg, #0B1220 0%, #132B46 55%, #0F766E 100%)',
      }
    },
  },
  plugins: [],
}
