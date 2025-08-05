/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'fondo-oscuro': '#1a202c',
        'superficie-oscura': '#2d3748',
        'primario-oscuro': '#4299e1',
        'texto-oscuro': '#e2e8f0',
        'texto-secundario-oscuro': '#a0aec0',

        'fondo-claro': '#f7fafc',
        'superficie-clara': '#ffffff',
        'primario-claro': '#3182ce',
        'texto-claro': '#1a202c',
        'texto-secundario-claro': '#4a5568',
      }
    }
  },
  plugins: [],
}