/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {



          "primary": "#661AE6",



          "secondary": "#D926AA",



          "accent": "#1FB2A5",



          "neutral": "#6b7280",



          "base-100": "#1f2937",



          "info": "#3ABFF8",



          "success": "#36D399",



          "warning": "#FBBD23",



          "error": "#F87272",
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
  ],
}

