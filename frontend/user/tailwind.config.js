/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    './node_modules/flyonui/dist/js/*.js',
    './node_modules/notyf/**/*.js',
    './node_modules/@editorjs/editorjs/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flyonui'),
    require('flyonui/plugin'),
    require('tailwindcss-motion'),
    require('@tailwindcss/typography')
  ],
  flyonui: {
    themes: [
      {
        rosepineDawn: {
          "primary": "#00a89c",
          "secondary": "#746f00",
          "accent": "#ffcb00",
          "neutral": "#292e38",
          "base-100": "#fafaff",
          "info": "#00b8f7",
          "success": "#00b15c",
          "warning": "#ffce00",
          "error": "#ff6c83"
        },
        rosepineMoon: {
          "primary": "#c4a7e7",
          "secondary": "#ea9a97",
          "accent": "#c4a7e7",
          "neutral": "#2a273f",
          "base-100": "#232136",
          "info": "#3e8fb0",
          "success": "#9ccfd8",
          "warning": "#f6c177",
          "error": "#eb6f92"
        }
      }
    ],
    darkTheme: 'rosepineMoon',
    vendors: true
  },
  safelist: ['motion-delay-[--delay]']
}