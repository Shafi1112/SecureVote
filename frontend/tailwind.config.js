export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        slatebrand: "#314057",
        mint: "#0f766e",
        gold: "#f59e0b",
        paper: "#f7fafc"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23,32,51,0.08)",
        lift: "0 22px 55px rgba(15,23,42,0.12)"
      }
    }
  },
  plugins: []
};
