/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        messageSent: '#1F1F1F',
        messageReceived: '#272727',
        accent: '#4A90E2',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0B0B0',
        border: '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        body: '16px',
        timestamp: '12px',
        username: '14px',
      },
      spacing: {
        header: '56px',
        inputBar: '48px',
      },
      animation: {
        'slide-in': 'slideIn 150ms ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};