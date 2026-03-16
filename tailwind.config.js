module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff8f1",
          100: "#ffe6d3",
          200: "#ffc39a",
          400: "#ff8a45",
          500: "#ff5a36",
          700: "#b8421d",
          950: "#24140f",
        },
        mint: {
          100: "#d9f4e8",
          500: "#0f9d7a",
        },
      },
      boxShadow: {
        shell: "0 28px 90px rgba(8, 6, 10, 0.24)",
      },
      fontFamily: {
        display: ['"Avenir Next"', '"Helvetica Neue"', "sans-serif"],
      },
    },
  },
};
