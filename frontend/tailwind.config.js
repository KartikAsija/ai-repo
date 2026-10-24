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
          card: '#141F32',
          surface: '#1A2940',
          accent: '#22C5E5',
          'accent-hover': '#06B6D4',
          text: '#F1F5F9',
          muted: '#94A3B8',
          border: '#29384F',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
        },
        slate: {
          950: '#0B1220', // Main background
          900: '#141F32', // Card background
          850: '#17243B',
          800: '#1A2940', // Elevated surfaces
          700: '#29384F', // Borders
          600: '#3D506E',
          500: '#64748B',
          400: '#94A3B8', // Secondary text
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9', // Primary text
          50: '#FFFFFF',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(120deg, #0B1220 0%, #142842 55%, #0E7490 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(26, 41, 64, 0.5) 0%, rgba(20, 31, 50, 0.8) 100%)',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-accent': '0 0 15px -3px rgba(34, 197, 229, 0.25)',
      }
    },
  },
  plugins: [],
}

