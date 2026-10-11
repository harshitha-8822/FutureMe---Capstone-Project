import colors from 'tailwindcss/colors';

/**
 * Theme-aware colours.
 *
 * Every shade of the families below is a CSS variable with a light value and a
 * dark value (set by the plugin at the bottom). Components keep writing plain
 * classes like `bg-slate-50 text-slate-900 bg-emerald-50 text-emerald-700`, and
 * they flip correctly when <html> has the `dark` class — no `dark:` variants needed.
 *
 *  - slate (neutrals) is remapped for dark: 50 = page, 100-300 = fills/borders,
 *    400-950 = progressively brighter text.
 *  - colour families keep their 300-600 (bars, buttons, gradients) but turn their
 *    pale tints (50-200) into deep tints and their dark text shades (700-950) light.
 *  - `surface` is the card/panel colour. `white` itself never changes, so
 *    `text-white` on gradients stays white.
 */

const BRAND = {
  50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
  500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
};

const FAMILIES = {
  brand: BRAND,
  ...Object.fromEntries(
    ['rose', 'fuchsia', 'amber', 'emerald', 'violet', 'orange', 'sky', 'yellow', 'green',
      'lime', 'cyan', 'teal', 'pink', 'red', 'purple', 'indigo', 'blue'].map((f) => [f, colors[f]]),
  ),
};
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const SURFACE = { light: '#ffffff', dark: '#131c2e' };

const SLATE_DARK = {
  50: '#0b1120', 100: '#1e293b', 200: '#2b3a52', 300: '#475569', 400: '#94a3b8',
  500: '#a3b1c6', 600: '#cbd5e1', 700: '#e2e8f0', 800: '#f1f5f9', 900: '#f8fafc', 950: '#ffffff',
};

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (hex, base, t) => {
  const a = rgb(hex);
  const b = rgb(base);
  return `#${a.map((v, i) => Math.round(v * t + b[i] * (1 - t)).toString(16).padStart(2, '0')).join('')}`;
};
const triplet = (hex) => rgb(hex).join(' ');

/** Dark value for a colour family step. */
function darkStep(scale, step) {
  if (step === 50) return mix(scale[500], SURFACE.dark, 0.14);
  if (step === 100) return mix(scale[500], SURFACE.dark, 0.22);
  if (step === 200) return mix(scale[500], SURFACE.dark, 0.38);
  if (step === 700) return scale[300];
  if (step === 800) return scale[200];
  if (step === 900) return scale[100];
  if (step === 950) return scale[50];
  return scale[step];
}

const varColors = { surface: 'rgb(var(--c-surface) / <alpha-value>)' };
const lightVars = { '--c-surface': triplet(SURFACE.light) };
const darkVars = { '--c-surface': triplet(SURFACE.dark) };

for (const [name, scale] of [['slate', colors.slate], ...Object.entries(FAMILIES)]) {
  varColors[name] = {};
  for (const step of STEPS) {
    const v = `--c-${name}-${step}`;
    varColors[name][step] = `rgb(var(${v}) / <alpha-value>)`;
    lightVars[v] = triplet(scale[step]);
    darkVars[v] = triplet(name === 'slate' ? SLATE_DARK[step] : darkStep(scale, step));
  }
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: varColors,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -8px rgb(15 23 42 / 0.10)',
        glow: '0 10px 30px -10px rgb(99 102 241 / 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    ({ addBase }) => {
      addBase({
        ':root': { ...lightVars, colorScheme: 'light' },
        '.dark': { ...darkVars, colorScheme: 'dark' },
      });
    },
  ],
};
