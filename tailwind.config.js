/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#080810',
          surface: '#0f0f1a',
          elevated: '#161625',
          card: '#1c1c2e',
        },
        accent: {
          emerald: '#00c896',
          gold: '#f5c842',
          rose: '#ff4d6d',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#9090a8',
          muted: '#5a5a72',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(at 20% 30%, #00c89620 0px, transparent 50%), radial-gradient(at 80% 70%, #f5c84215 0px, transparent 50%), radial-gradient(at 50% 50%, #0f0f1a 0px, #080810 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
