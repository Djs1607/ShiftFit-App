/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // ── Shift Fit Design System — warm neutral ramp (matches landing page) ──
        ink: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#101010',
          800: '#171717',
          750: '#1E1E1E',
          700: '#262626',
          650: '#333333',
          600: '#4A4A47',
          500: '#5C5B56',
          400: '#6B6A63',
          300: '#A3A29A',
          200: '#D4D3CE',
          100: '#F6F5F1',
          0: '#FFFFFF',
        },
        // primary — coral: the ONLY saturated brand colour, matched to
        // theshiftfitapp.com. 500 (ember) is a calmer, deeper tone for
        // large fills (buttons/CTAs) so they don't shout when read
        // half-asleep; 400 is the original vivid landing-page coral,
        // reserved for thin marks — focus rings, hover states, small text.
        coral: {
          700: '#A0421F',
          600: '#C2542A',
          500: '#E2603F',
          400: '#FF6A45',
          300: '#FFA68F',
          100: '#FFD9CE',
        },
        // amber = coral, on purpose. There is no second brand hue anymore;
        // this stays a separate key only because `amber-*` / warning
        // classes are referenced directly across the app, and giving it
        // identical values retires the old gold without a rename pass.
        amber: {
          700: '#A0421F',
          600: '#C2542A',
          500: '#E2603F',
          400: '#FF6A45',
          300: '#FFA68F',
        },
        green: { 500: '#5E9E7E', 400: '#74B694' },
        red: { 500: '#C4614F', 400: '#D67C69' },
        // fatigue scale: 1 fresh -> 5 critical. Independent of the brand
        // coral above.
        fatigue: {
          1: '#5E9E7E',
          2: '#8FA96C',
          3: '#D68A3A',
          4: '#D07E4A',
          5: '#C4614F',
        },
        // shift phase colours — fully neutral grey. A data track, not a
        // brand surface: it must never compete with the single coral
        // accent, so day/night/swing read by value (light -> dark), not
        // by colour.
        shift: {
          day: '#A3A29A',
          swing: '#7A7972',
          night: '#4A4944',
          off: '#2A2A26',
        },
        // semantic surface/background aliases (see src/index.css :root)
        bg: {
          base: 'var(--bg-base)',
          sunken: 'var(--bg-sunken)',
          scrim: 'var(--bg-scrim)',
        },
        surface: {
          card: 'var(--surface-card)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          inset: 'var(--surface-inset)',
          hover: 'var(--surface-hover)',
          press: 'var(--surface-press)',
          selected: 'var(--surface-selected)',
        },
        line: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        fg: {
          primary: 'var(--text-primary)',
          body: 'var(--text-body)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          onPrimary: 'var(--text-on-primary)',
          onAccent: 'var(--text-on-accent)',
        },
        action: {
          primary: {
            DEFAULT: 'var(--action-primary)',
            hover: 'var(--action-primary-hover)',
            press: 'var(--action-primary-press)',
            quiet: 'var(--action-primary-quiet)',
          },
          accent: {
            DEFAULT: 'var(--action-accent)',
            hover: 'var(--action-accent-hover)',
            press: 'var(--action-accent-press)',
            quiet: 'var(--action-accent-quiet)',
          },
        },
        feedback: {
          success: { DEFAULT: 'var(--feedback-success)', quiet: 'var(--feedback-success-quiet)' },
          warning: { DEFAULT: 'var(--feedback-warning)', quiet: 'var(--feedback-warning-quiet)' },
          danger: { DEFAULT: 'var(--feedback-danger)', quiet: 'var(--feedback-danger-quiet)' },
          info: { DEFAULT: 'var(--feedback-info)', quiet: 'var(--feedback-info-quiet)' },
        },
        data: {
          track: 'var(--data-track)',
          grid: 'var(--data-grid)',
        },
        // ── shadcn/ui scaffold aliases (kept for components/ui/*, unused by app pages) ──
        border: "var(--border-default)",
        input: "var(--border-default)",
        ring: "var(--border-focus)",
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--action-primary)",
          foreground: "var(--text-on-primary)",
        },
        secondary: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--feedback-danger)",
          foreground: "var(--text-on-primary)",
        },
        muted: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--action-accent)",
          foreground: "var(--text-on-accent)",
        },
        popover: {
          DEFAULT: "var(--surface-overlay)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--surface-card)",
          foreground: "var(--text-primary)",
        },
        sidebar: {
          DEFAULT: "var(--surface-card)",
          foreground: "var(--text-primary)",
          primary: "var(--action-primary)",
          "primary-foreground": "var(--text-on-primary)",
          accent: "var(--action-accent)",
          "accent-foreground": "var(--text-on-accent)",
          border: "var(--border-default)",
          ring: "var(--border-focus)",
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
        control: '10px',
        card: '14px',
        sheet: '20px',
        pill: '9999px',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: '0 1px 2px rgba(0,0,0,.40)',
        md: '0 4px 12px rgba(0,0,0,.45)',
        lg: '0 12px 32px rgba(0,0,0,.55)',
        sheet: '0 -8px 32px rgba(0,0,0,.60)',
        'glow-primary': '0 0 0 1px rgba(255,106,69,.40), 0 0 20px rgba(255,106,69,.18)',
        'glow-accent': '0 0 0 1px rgba(255,106,69,.40), 0 0 24px rgba(255,106,69,.20)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.2,0,0,1)',
        out: 'cubic-bezier(.16,1,.3,1)',
        in: 'cubic-bezier(.6,0,1,1)',
        mechanical: 'cubic-bezier(.5,0,.2,1)',
      },
      transitionDuration: {
        instant: '80ms',
        fast: '140ms',
        base: '220ms',
        slow: '320ms',
        sheet: '420ms',
        meter: '900ms',
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
        "sf-rise": {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        "sf-breathe": {
          "0%,100%": { opacity: '.55' },
          "50%": { opacity: '1' },
        },
        "sf-sweep": {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(200%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "rise-in": "sf-rise 420ms cubic-bezier(.16,1,.3,1)",
        "breathe": "sf-breathe 2400ms ease-in-out infinite",
        "sweep": "sf-sweep 1.4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
