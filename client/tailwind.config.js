/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'taskboard-amber': '#f59e0b'
      },
      backgroundImage: {
        'taskboard-glow':
          'radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(59, 130, 246, 0.15), transparent 30%), linear-gradient(135deg, #0f172a, #0b1021)'
      }
    }
  },
  plugins: []
};
