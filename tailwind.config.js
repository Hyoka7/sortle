/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui'],
      serif: ['"Times New Roman"', 'ui-serif', 'serif'],
    },
  },
  plugins: [],
};
