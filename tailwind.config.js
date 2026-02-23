/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7', // Sky 600
          light: '#38bdf8',   // Sky 400
          dark: '#0369a1',    // Sky 700
        },
        secondary: {
          DEFAULT: '#64748b', // Slate 500
          light: '#94a3b8',   // Slate 400
          dark: '#475569',    // Slate 600
        },
        accent: {
          DEFAULT: '#14b8a6', // Teal 500
          hover: '#0d9488',   // Teal 600
        },
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
        text: {
          primary: '#0f172a',   // Slate 900
          secondary: '#475569', // Slate 600
          muted: '#94a3b8',     // Slate 400
        },
        status: {
          booked: '#3b82f6',      // Blue 500
          arrived: '#f59e0b',     // Amber 500
          'in-consultation': '#8b5cf6', // Violet 500
          completed: '#10b981',   // Emerald 500
          cancelled: '#ef4444',   // Red 500
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.08)',
        'glow': '0 0 15px rgba(2, 132, 199, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
