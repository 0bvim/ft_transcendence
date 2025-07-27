/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro Sci-Fi Vaporwave Palette
        primary: {
          50: '#fdf2ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',  // Main magenta
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        secondary: {
          50: '#0f0f23',
          100: '#1a1a3a',
          200: '#262651',
          300: '#323268',
          400: '#3e3e7f',
          500: '#4a4a96',  // Deep space blue
          600: '#5656ad',
          700: '#6262c4',
          800: '#6e6edb',
          900: '#7a7af2',
          950: '#8686ff',
        },
        neon: {
          pink: '#ff00ff',      // Electric magenta
          cyan: '#00ffff',      // Electric cyan
          purple: '#8000ff',    // Electric purple
          blue: '#0080ff',      // Electric blue
          green: '#00ff80',     // Electric green
        },
        synthwave: {
          bg: '#0a0a0f',        // Deep dark background
          grid: '#ff00ff',      // Magenta grid
          horizon: '#663399',   // Purple horizon
          glow: '#ff0080',      // Pink glow
        },
        success: {
          50: '#f0fff4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00ff80',  // Neon green
          600: '#00cc66',
          700: '#009944',
          800: '#007733',
          900: '#005522',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffaa00',  // Neon orange
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ff0040',  // Neon red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        retro: ['Orbitron', 'Exo 2', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(255, 0, 255, 0.1), 0 10px 20px -2px rgba(255, 0, 255, 0.05)',
        'medium': '0 4px 25px -5px rgba(255, 0, 255, 0.2), 0 10px 10px -5px rgba(255, 0, 255, 0.1)',
        'large': '0 10px 50px -12px rgba(255, 0, 255, 0.3)',
        'glow': '0 0 20px rgba(255, 0, 255, 0.5)',
        'glow-lg': '0 0 40px rgba(255, 0, 255, 0.7)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'glow-cyan-lg': '0 0 40px rgba(0, 255, 255, 0.7)',
        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff',
        'neon-cyan': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff',
        'neon-purple': '0 0 5px #8000ff, 0 0 10px #8000ff, 0 0 15px #8000ff, 0 0 20px #8000ff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'synthwave-grid': 'linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px)',
        'retro-horizon': 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 30%, #16213e 60%, #663399 100%)',
        'neon-gradient': 'linear-gradient(45deg, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)',
        'vaporwave': 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 20%, #2d1b69 40%, #ff00ff 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'grid-flow': 'gridFlow 20s linear infinite',
        'neon-flicker': 'neonFlicker 0.1s infinite alternate',
        'synthwave-scan': 'synthwaveScan 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff' },
          '100%': { boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff' },
        },
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        synthwaveScan: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 