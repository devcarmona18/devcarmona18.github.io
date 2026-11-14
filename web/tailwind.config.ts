import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.ts'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentHover: 'rgb(var(--accent-hover) / <alpha-value>)',
        onAccent: 'rgb(var(--on-accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Arial Black"', 'sans-serif'],
        body: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
