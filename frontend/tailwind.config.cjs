module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  important: true,
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { cream: '#F5F5F5', 'dark-cocoa': '#3E2723', rose: '#E91E63' },
      fontFamily: { inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] }
    }
  },
  plugins: []
};
