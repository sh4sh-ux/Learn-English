/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
        canvas: '#F8FAFC',
        primary: '#2563EB',
        conversation: '#0B1730',
        surface: '#152544'
      },
      boxShadow: { soft: '0 10px 35px rgba(15, 23, 42, 0.08)' },
      fontFamily: { sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] }
    }
  },
  plugins: []
}
