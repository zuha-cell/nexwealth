/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141A2E",       // near-black navy for text
        paper: "#F6F7F5",     // cool off-white background
        indigo: "#1B2A4A",    // primary brand
        indigoLight: "#2E4372",
        gold: "#C79A45",      // prosperity accent, used sparingly
        gain: "#1F7A5C",      // positive numbers (SIP growth, returns)
        loss: "#B23B3B",      // negative numbers
        line: "#D8DCE3",      // hairline dividers
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],       // headline serif, distinct personality
        sans: ["'Inter'", "system-ui", "sans-serif"], // body
        mono: ["'IBM Plex Mono'", "monospace"],  // numbers/data
      },
    },
  },
  plugins: [],
};
