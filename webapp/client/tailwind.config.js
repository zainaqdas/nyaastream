/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6", // Purple
        secondary: "#EC4899", // Pink
        accent: "#06B6D4", // Cyan
        background: "#0F172A", // Dark Slate
        card: "#1E293B",
      },
    },
  },
  plugins: [],
}
