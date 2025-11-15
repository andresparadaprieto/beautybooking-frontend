/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Busca clases Tailwind en todos estos archivos
  ],
  theme: {
    extend: {
      // Colores personalizados para tu marca
      colors: {
        'beauty': {
          50: '#fff0f9',
          100: '#ffe3f5',
          200: '#ffc6ea',
          300: '#ff98d8',
          400: '#ff58bc',
          500: '#ff27a1', // Color principal - rosa/magenta
          600: '#ef0f78',
          700: '#d70662',
          800: '#b10752',
          900: '#920a47',
        },
        'primary': '#ff27a1', // Color principal para accesos rápidos
        'secondary': '#6b7280', // Gris para elementos secundarios
      },
      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Mejora los estilos de formularios
  ],
}