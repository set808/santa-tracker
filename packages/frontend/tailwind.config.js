/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#C41E3A',
          green: '#165B33',
          gold: '#FFD700',
          snow: '#FFFAFA',
          darkGreen: '#0F4420',
          lightRed: '#E63946',
        },
        newrelic: {
          green: '#1CE783',
          teal: '#00AC69',
          dark: '#0A1E1F',
          gray: '#464649',
        }
      },
      fontFamily: {
        christmas: ['"Mountains of Christmas"', 'cursive'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'snow-fall': 'snow-fall 10s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'sleigh-move': 'sleigh-move 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'snow-fall': {
          '0%': { transform: 'translateY(-10vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'sleigh-move': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(10px) translateY(-5px)' },
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(28, 231, 131, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(28, 231, 131, 0.6)',
          },
        },
      },
    },
  },
  plugins: [],
}
