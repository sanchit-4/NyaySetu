module.exports = {
  // ...existing config...
  theme: {
    extend: {
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    // ...existing plugins...
    require("@tailwindcss/aspect-ratio"),
  ],
};
