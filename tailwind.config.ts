import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Opción 1: Si tus archivos están en la raíz
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Opción 2: Si tus archivos están dentro de 'src'
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Opción 3: Cualquier archivo TSX en la raiz (por si acaso)
    "./*.{js,ts,jsx,tsx,mdx}" 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;