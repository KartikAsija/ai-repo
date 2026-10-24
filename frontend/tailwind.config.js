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
          bg: '#0D1117',
          card: '#161B22',
          surface: '#21262D',
          border: '#30363D',
          accent: '#58A6FF',
          'accent-hover': '#79C0FF',
          text: '#F0F6FC',
          muted: '#8B949E',
          success: '#3FB950',
          warning: '#D29922',
          error: '#F85149',
        },
        slate: {
          950: '#0D1117', // Main background
          900: '#161B22', // Card background
          850: '#1C2128',
          800: '#21262D', // Elevated surfaces / inputs
          700: '#30363D', // Borders
          600: '#484F58',
          500: '#6E7681',
          400: '#8B949E', // Secondary text
          300: '#C9D1D9',
          200: '#E6EDF3',
          100: '#F0F6FC', // Primary text
          50: '#FFFFFF',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
