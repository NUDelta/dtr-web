module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: "#FFF056",
        "dark-yellow": "#f5ed9c",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
