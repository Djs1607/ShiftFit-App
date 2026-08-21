/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Oswald', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // obsidian/charcoal neutral ramp — the page ground and every surface above it.
        // Lighter at the 400/500 steps than stock zinc: secondary copy has to
        // survive a dim phone screen at 4am.
        ink: {
          50: '#f6f6fa',
          100: '#e8e8f0',
          200: '#cfcfdc',
          300: '#ababc0',
          400: '#82829a',
          500: '#5f5f76',
          600: '#454558',
          700: '#2f2f42',
          800: '#232336',
          900: '#1a1a2e',
          950: '#0f0f1a',
        },
        // brand accent — anything interactive, branded, or "you did it"
        shock: {
          200: '#ecdcff',
          300: '#ddc4ff',
          400: '#c8a2ff',
          500: '#b184f5',
          600: '#9663df',
        },
        // warm accent — Today homepage hero (Gymverse/Runna-style redesign)
        ember: {
          200: '#ffd8b8',
          300: '#ffb27a',
          400: '#ff8c42',
          500: '#f4732b',
          600: '#d95e1c',
        },
        // load ramp — fatigue, intensity, recommendation. Deliberately NOT
        // lavender: these encode meaning and must never read as a button.
        fresh: { 300: '#a8f5e0', 400: '#6fe3c6' },
        steady: { 300: '#d9e879', 400: '#c3d94a' },
        caution: { 300: '#fcd34d', 400: '#f5b220' },
        cooked: { 300: '#fda4af', 400: '#f76b7f' },
        // shift type — night stays firmly blue-violet so it never gets mistaken
        // for the lavender accent sitting next to it
        night: { 300: '#9aa5ff', 400: '#6b7cff' },
        day: { 300: '#8fd6ff', 400: '#38bdf8' },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}