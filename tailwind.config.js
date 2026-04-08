/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        bg:       '#0a0c0f',
        surface:  '#111418',
        surface2: '#181c22',
        surface3: '#1d2330',
        border:   '#1e2530',
        border2:  '#252d3a',
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#e8c96a',
          dim:     'rgba(201,168,76,0.12)',
        },
        felo: {
          green:  '#3ecf8e',
          red:    '#f26969',
          blue:   '#5b9cf6',
          purple: '#a78bfa',
          orange: '#fb923c',
          text:   '#e8eaf0',
          text2:  '#8a94a6',
          text3:  '#4e5a6e',
        },
      },
      borderRadius: {
        card: '14px',
        sm:   '8px',
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease both',
        'fade-in':  'fadeIn 0.3s ease',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
