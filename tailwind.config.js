module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff7f0",
          100: "#ffe9d8",
          200: "#ffd0af",
          400: "#ff8647",
          500: "#ff5f2e",
          700: "#b53a19",
          950: "#171119",
        },
        mint: {
          100: "#dff7ee",
          500: "#16a085",
        },
      },
      boxShadow: {
        shell: "0 24px 80px rgba(8, 6, 10, 0.28)",
      },
      fontFamily: {
        display: ['"Avenir Next"', '"Helvetica Neue"', "sans-serif"],
      },
    },
  },
};
