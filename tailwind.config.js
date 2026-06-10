/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./components/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        muted: "var(--color-muted)",
        foreground: "var(--color-foreground)",
        "muted-text": "var(--color-muted-text)",
        accent: "var(--color-accent)",
        "accent-secondary": "var(--color-accent-secondary)",
        border: "var(--color-border)"
      },
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Space Grotesk", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        label: "0.2em"
      }
    }
  },
  plugins: []
}
