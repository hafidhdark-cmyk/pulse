/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F8FF',
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#DCE7F9',
          muted: '#F8FAFC'
        },
        brand: {
          blue: {
            DEFAULT: '#1D4ED8',
            hover: '#1E40AF',
            light: '#2563EB',
            subtle: '#EFF6FF',
            border: '#BFDBFE'
          },
          cyan: {
            DEFAULT: '#0EA5E9',
            dark: '#0284C7',
            subtle: '#E0F2FE'
          }
        },
        ink: {
          primary: '#0F172A',
          secondary: '#475569',
          subtle: '#52627A',
          muted: '#64748B'
        },
        status: {
          success: {
            bg: '#DCFCE7',
            text: '#15803D'
          },
          info: {
            bg: '#EFF6FF',
            text: '#1D4ED8'
          },
          warning: {
            bg: '#FEF3C7',
            text: '#B45309'
          },
          danger: {
            bg: '#FEE2E2',
            text: '#B91C1C'
          }
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        card: '0 4px 14px rgba(29, 78, 216, 0.04)',
        elevation: '0 10px 30px -5px rgba(29, 78, 216, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        hero: '0 12px 36px -6px rgba(35, 94, 227, 0.35)'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px'
      }
    },
  },
  plugins: [],
}
