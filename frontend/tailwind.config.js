/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Cloudera enterprise palette (cloudera.com / Enterprise AI page)
        'cloudera-navy': '#120046',
        'cloudera-purple': '#5555F9',
        'cloudera-purple-dim': '#413CC3',
        'cloudera-orange': '#FF550D',
        'cloudera-green': '#46A971',
        'surface-0': '#F5F8FA',
        'surface-1': '#FFFFFF',
        'surface-2': '#FFFFFF',
        'surface-3': '#E8EEF2',
        'surface-4': '#CEDBE4',
        accent: '#5555F9',
        'accent-dim': '#413CC3',
        'accent-cta': '#FF550D',
        'status-red': '#D92D20',
        'status-red-dim': '#FEE4E2',
        'status-amber': '#DC6803',
        'status-amber-dim': '#FEF0C7',
        'status-green': '#46A971',
        'status-green-dim': '#E3F5EC',
        'status-purple': '#413CC3',
        'status-purple-dim': '#EBE9FE',
        ink: {
          DEFAULT: '#120046',
          secondary: '#4D4D4D',
          muted: '#696969',
          faint: '#98A2B3',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(18, 0, 70, 0.06), 0 1px 3px rgba(18, 0, 70, 0.08)',
        header: '0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-slide-in': 'fadeSlideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 45, 32, 0.25)' },
          '50%': { boxShadow: '0 0 0 4px rgba(217, 45, 32, 0.08)' },
        },
      },
    },
  },
  plugins: [],
};
