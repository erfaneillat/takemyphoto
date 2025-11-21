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
        // Dark mode surface colors - solid dark backgrounds
        surface: {
          DEFAULT: '#0A0A0A',  // Solid dark
          hover: '#1A1A1A',    // Slightly lighter
          active: '#2A2A2A',   // Even lighter
          card: '#111111',     // Solid dark for cards
          elevated: '#1F1F1F', // Slightly lighter for elevated elements
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
          light: '#333333', // Solid dark gray for dark mode borders
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
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'scroll-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'scroll-x': 'scroll-x 30s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
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
        '.mask-image-linear-gradient': {
          'mask-image': 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          '-webkit-mask-image': 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        },
      });
    },
  ],
}
