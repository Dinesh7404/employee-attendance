/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e293b',
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
