/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            sans: ['"Noto Sans JP"', "ui-sans-serif", "system-ui"],
            serif: ['"Times New Roman"', "ui-serif", "serif"],
        },
    },
    plugins: [],
};
