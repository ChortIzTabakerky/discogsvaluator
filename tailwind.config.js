/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      colors: {
        discogs: {
          header: "#222222",
          nav: "#1a1a1a",
          bg: "#f4f4f6",
          card: "#ffffff",
          border: "#e0e0e0",
          borderLight: "#eeeeee",
          text: "#333333",
          heading: "#111111",
          muted: "#666666",
          subtle: "#888888",
          blue: "#0275d8",
          blueDark: "#01549b",
          blueLight: "#388bfd",
          blueTint: "#eaf3fc",
          // Mobile Dark Mode Palette
          darkBg: "#121212",
          darkSurface: "#1a1a1a",
          darkCard: "#222222",
          darkCardHover: "#282828",
          darkBorder: "#333333",
          darkBorderLight: "#3e3e3e",
          darkText: "#f0f0f0",
          darkMuted: "#9e9e9e",
          darkSubtle: "#707070",
        }
      }
    },
  },
  plugins: [],
};
