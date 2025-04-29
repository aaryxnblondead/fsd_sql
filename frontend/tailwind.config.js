/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'hr-primary': '#4a6cf7',
        'hr-primary-dark': '#3a5cd7',
        'hr-dark': '#0a0a23',
        'hr-dark-secondary': '#1a1b35',
        'hr-dark-accent': '#2e3856',
        'hr-blue': '#4184f3',
        'hr-green': '#3cba54',
        'hr-orange': '#f59f00',
        'hr-red': '#db3a34',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} 