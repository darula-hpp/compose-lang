import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue-500
          dark: '#2563EB', // Blue-600
        },
        secondary: {
          DEFAULT: '#6B7280', // Gray-500
          dark: '#4B5563', // Gray-600
        },
        background: {
          light: '#F9FAFB', // Gray-50
          dark: '#111827', // Gray-900
        },
        card: {
          light: '#FFFFFF',
          dark: '#1F2937', // Gray-800
        },
        text: {
          light: '#1F2937', // Gray-800
          dark: '#F9FAFB', // Gray-50
        },
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 4px 6px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
