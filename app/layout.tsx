import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HablaConmigo - Plataforma de Apoyo al Lenguaje",
  description: "Plataforma interactiva para niños con Trastorno del Desarrollo del Lenguaje (TDL). Proyecto de Interfaces de Usuario Avanzadas - Universidad Veracruzana.",
  keywords: ["TDL", "lenguaje", "niños", "terapia", "educación", "accesibilidad"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}