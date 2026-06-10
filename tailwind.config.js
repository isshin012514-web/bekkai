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
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        fail: {
          DEFAULT: 'var(--color-fail)',
          bg: 'var(--color-fail-bg)',
          danger: 'var(--color-fail-danger)',
          'danger-bg': 'var(--color-fail-danger-bg)',
        },
        real: {
          DEFAULT: 'var(--color-real)',
          bg: 'var(--color-real-bg)',
        },
        'border-card': 'var(--color-border-card)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        // Discovery 8M colors (resolved via scoped CSS variables)
        bg: 'var(--color-bg)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        text: 'var(--color-text)',
        'text-dim': 'var(--color-text-dim)',
        'text-muted': 'var(--color-text-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        purpose: 'var(--color-purpose)',
        goal: 'var(--color-goal)',
        problem: 'var(--color-problem)',
        past: 'var(--color-past)',
        self: 'var(--color-self)',
        around: 'var(--color-around)',
        market: 'var(--color-market)',
        future: 'var(--color-future)',
        center: 'var(--color-center)',
      },
    },
  },
  plugins: [],
}
