/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          bg: 'var(--color-primary-bg)',
          light: 'var(--color-primary-light)',
        },
        done: {
          DEFAULT: 'var(--color-done)',
          bg: 'var(--color-done-bg)',
        },
        waiting: {
          DEFAULT: 'var(--color-waiting)',
          bg: 'var(--color-waiting-bg)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
        },
        'border-card': 'var(--color-border-card)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
      },
    },
  },
  plugins: [],
}
