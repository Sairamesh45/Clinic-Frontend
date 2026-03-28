/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b74ff', // Bright blue (Wix-like)
          light: '#60a4ff',
          dark: '#0546d0',
        },
        secondary: {
          DEFAULT: '#64748b', // Slate 500 (kept)
          light: '#94a3b8',
          dark: '#475569',
        },
        accent: {
          DEFAULT: '#14b8a6',
          hover: '#0d9488',
        },
        background: '#f8fafc',
        surface: '#ffffff',
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        status: {
          booked: '#3b82f6',
          arrived: '#f59e0b',
          'in-consultation': '#8b5cf6',
          completed: '#10b981',
          cancelled: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Poppins"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
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
