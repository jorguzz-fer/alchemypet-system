/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F5EBF7',
                    100: '#E8D4EC',
                    200: '#D4A9DB',
                    300: '#BB8FCE',
                    400: '#A76BBF',
                    500: '#9B59B6',
                    600: '#7B3F9E',
                    700: '#5B2F76',
                    800: '#3C1F4E',
                    900: '#1D0F27',
                },
                gold: {
                    50: '#FDF8E7',
                    100: '#FAEED0',
                    200: '#F5DDA1',
                    300: '#E8C547',
                    400: '#D4A017',
                    500: '#B8860B',
                    600: '#8B6914',
                    700: '#5E4C0F',
                    800: '#312F0A',
                    900: '#141205',
                },
            },
        },
    },
    plugins: [],
}
