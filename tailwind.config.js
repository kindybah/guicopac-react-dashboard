/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gpc: {
          yellow: '#facc15',
          black: '#0b0f19'
        }
      },
      boxShadow: {
        soft: '0 18px 60px rgba(2, 6, 23, 0.10)'
      },
      borderRadius: {
        xl2: '18px',
        xl3: '22px'
      }
    }
  },
  plugins: []
}
