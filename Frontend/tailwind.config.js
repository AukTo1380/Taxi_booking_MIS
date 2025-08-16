/** @type {import('tailwindcss').Config} */

import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#14A617",
        secondary: "#B8D5B7",
      },
      fontFamily: {
        vazirmatn: ["Vazirmatn", "Arial", "sans-serif"],
        Ray: ["Ray"],
        Ray_black: ["Ray_black"],
        Ray_text: ["Ray_text"],
      },
      container: {
        padding: {
          DEFAULT: "0.5rem",
          sm: "0.5rem",
          lg: "1rem",
          xl: "2rem",
          "2xl": "3rem",
        },
      },
    },
  },
  plugins: [],
};
