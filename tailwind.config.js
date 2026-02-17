/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0078D4',
          hover: '#106EBE',
          light: '#DEECF9',
          dark: '#004578',
        },
        accent: '#0067C0',
        success: '#107C10',
        warning: '#FF8C00',
        danger: '#D13438',
        sidebar: {
          bg: '#202020',
          text: '#FFFFFF',
          hover: '#333333',
          active: '#0078D4',
        },
        win: {
          bg: '#F5F5F5',
          card: '#FFFFFF',
          header: '#F3F3F3',
          border: '#E5E5E5',
          text: '#1A1A1A',
          'text-secondary': '#616161',
        }
      },
      boxShadow: {
        'win': '0 2px 4px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
        'win-hover': '0 4px 8px rgba(0,0,0,0.08), 0 0 4px rgba(0,0,0,0.08)',
        'win-modal': '0 8px 32px rgba(0,0,0,0.12), 0 0 4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'win': '8px',
        'win-lg': '12px',
      }
    },
  },
  plugins: [],
}