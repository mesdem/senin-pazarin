/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Tema değişimi için önemli
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#3bd2ff",
          DEFAULT: "#00b4d8",
          dark: "#0090b1",
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
