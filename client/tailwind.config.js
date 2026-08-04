/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E11D48',
          redHover: '#BE123C',
          green: '#059669',
          greenLight: '#ECFDF5',
          amber: '#D97706',
          darkText: '#0F172A',
          subText: '#475569',
          bgLight: '#F8FAFC',
          cardBg: '#FFFFFF',
          borderLight: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(225, 29, 72, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
