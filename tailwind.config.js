/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Instrument Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
