/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00571a',
        secondary: '#03BC42',
        accent: '#FED202',
        'brand-green': '#03BC42',
        'brand-yellow': '#FED202',
        'background-light': '#f5f8f6',
        'background-dark': '#0f2315',
        'saeg-green': '#1B7F3A',
        'saeg-dark': '#0B2B16',
        'saeg-yellow': '#F2C94C',
        'saeg-cream': '#FFF6E6',
        'saeg-red': '#D64545',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
};
