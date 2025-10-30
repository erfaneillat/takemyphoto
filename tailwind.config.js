/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        persian: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Pure Black and White theme
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          dark: '#000000',
        },
        sidebar: {
          DEFAULT: '#000000',
          hover: '#1A1A1A',
        },
        primary: {
          DEFAULT: '#000000',
          light: '#404040',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#000000',
          light: '#404040',
          dark: '#000000',
        },
        // Dark mode surface colors with white opacity
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',  // 5% white
          hover: 'rgba(255, 255, 255, 0.10)',    // 10% white
          active: 'rgba(255, 255, 255, 0.15)',   // 15% white
          card: 'rgba(255, 255, 255, 0.10)',     // 10% white for cards
          elevated: 'rgba(255, 255, 255, 0.20)', // 20% white for elevated elements
        },
        // Grayscale palette replacing teal
        teal: {
          DEFAULT: '#000000',
          light: '#404040',
          dark: '#000000',
          50: '#F9F9F9',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#C0C0C0',
          400: '#A0A0A0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#202020',
          900: '#000000',
        },
        foreground: {
          DEFAULT: '#000000',
          secondary: '#6B7280',
          light: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#000000',
          light: 'rgba(255, 255, 255, 0.20)', // 20% white for dark mode borders
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
}
