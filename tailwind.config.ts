/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pcfi: {
          green: {
            50: '#f0f7ed',
            100: '#d9ecd2',
            200: '#b2d9a5',
            300: '#7dbf72',
            400: '#52a344',
            500: '#3a8730',
            600: '#2d6b25',
            700: '#255520',
            800: '#1e431b',
            900: '#163217',
          },
          gold: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#d4a017',
            600: '#b8860b',
            700: '#926808',
            800: '#744d06',
            900: '#523604',
          },
          earth: {
            50: '#fdf8f0',
            100: '#f9edd6',
            200: '#f2d9ac',
            300: '#e8bf78',
            400: '#dca04c',
            500: '#c8832a',
            600: '#a66420',
            700: '#854c1b',
            800: '#6b3c18',
            900: '#573215',
          },
        },
      },
      fontFamily: {
        display: ['Merriweather', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(22,50,23,0.85) 0%, rgba(61,135,48,0.6) 100%)',
      },
    },
  },
  plugins: [],
};
