/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C89B3C",
          light: "#E5C76B",
          dark: "#8B6B2A",
          glow: "rgba(200, 155, 60, 0.5)"
        },
        silver: {
          DEFAULT: "#C0C0C0",
          light: "#E8E8E8",
          dark: "#A8A8A8",
          100: "#F5F5F5",
          200: "#E8E8E8",
          300: "#D4D4D4",
          400: "#C0C0C0",
          500: "#A8A8A8",
          600: "#8C8C8C",
        },
        brick: {
          DEFAULT: "#C89B3C",
          light: "#E5C76B",
          dark: "#8B6B2A",
          glow: "rgba(200, 155, 60, 0.5)"
        },
        brick: {
          DEFAULT: "#7A2F1F",
          light: "#A64D3A",
          dark: "#4A1F14",
          glow: "rgba(122, 47, 31, 0.5)"
        },
        ivory: {
          DEFAULT: "#F5F4F2",
          light: "#FFFFFF",
          dark: "#D4D3D1"
        },
        charcoal: {
          DEFAULT: "#0E0E0E",
          light: "#1A1A1A",
          dark: "#050505"
        },
        obsidian: "#0A0A0A"
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 8vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 6vw, 4rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.5rem, 4vw, 2.5rem)', { lineHeight: '1.2' }],
        'body-lg': ['clamp(1rem, 2vw, 1.25rem)', { lineHeight: '1.6' }],
        'body-md': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.7' }],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'gradient': 'gradient 8s ease infinite',
        'blob': 'blob 10s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'blob': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'magical-glow': 'radial-gradient(circle at 30% 20%, rgba(200,155,60,0.15), transparent 50%), radial-gradient(circle at 80% 60%, rgba(122,47,31,0.2), transparent 50%)',
        'gradient-animated': 'linear-gradient(-45deg, #C89B3C, #7A2F1F, #C89B3C)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(200, 155, 60, 0.3)',
        'gold-glow-lg': '0 0 60px rgba(200, 155, 60, 0.4), 0 0 100px rgba(200, 155, 60, 0.2)',
        'brick-glow': '0 0 30px rgba(122, 47, 31, 0.3)',
        'inner-gold': 'inset 0 0 20px rgba(200, 155, 60, 0.2)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  },
  plugins: []
}
