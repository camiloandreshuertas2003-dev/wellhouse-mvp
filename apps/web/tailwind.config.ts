import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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

        /* Custom Design System Colors */
        'ink-teal': {
          900: 'var(--ink-teal-900)',
          700: 'var(--ink-teal-700)',
          500: 'var(--ink-teal-500)',
        },
        'primary-cobalt': 'var(--primary-cobalt)',
        'secondary-ink': 'var(--secondary-ink)',
        'base-paper': 'var(--base-paper)',
        'surface-mist': {
          DEFAULT: 'var(--surface-mist)',
          dark: 'var(--surface-mist-dark)',
        },
        'accent-mango': {
          DEFAULT: 'var(--accent-mango)',
          hover: 'var(--accent-mango-hover)',
          light: 'var(--accent-mango-light)',
        },
        'signal': {
          green: 'var(--signal-green)',
          red: 'var(--signal-red)',
        },
        'wellpoint-gold': 'var(--wellpoint-gold)',
        'text-muted-custom': 'var(--text-muted)',
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        plex: ['var(--font-plex)', 'monospace'],
      },
      boxShadow: {
        'shadow-sm': '0 1px 3px rgba(15, 61, 62, 0.08)',
        'shadow-md': '0 4px 12px rgba(15, 61, 62, 0.12)',
        'shadow-lg': '0 12px 32px rgba(15, 61, 62, 0.18)',
      },
      borderRadius: {
        'radius-sm': '6px',
        'radius-md': '12px',
        'radius-lg': '20px',
        'radius-full': '999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config
