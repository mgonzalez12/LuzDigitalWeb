import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luz Digital - La Palabra en Nueva Luz",
  description: "Una experiencia digital moderna y open-source para el cristiano contemporáneo. Sumérgete en la espiritualidad con diseño de alta tecnología.",
  keywords: ["Biblia", "lectura bíblica", "cristiano", "espiritualidad", "open-source", "digital"],
  authors: [{ name: "Luz Digital" }],
  openGraph: {
    title: "Luz Digital - La Palabra en Nueva Luz",
    description: "Una experiencia digital moderna y open-source para el cristiano contemporáneo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
