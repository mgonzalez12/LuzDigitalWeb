import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://luzdigitals.com'),
  title: {
    default: "Luz Digital - La Palabra en Nueva Luz",
    template: "%s | Luz Digital",
  },
  description: "Una experiencia digital moderna para el creyente de hoy. Sumérgete en la Palabra y el amor de Dios con un diseño inspirador.",
  keywords: ["Biblia", "lectura bíblica", "cristiano", "espiritualidad", "open-source", "digital", "Biblia online", "versículos bíblicos"],
  authors: [{ name: "Luz Digital" }],
  creator: "Luz Digital",
  publisher: "Luz Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icono_luz_digital.ico',
    shortcut: '/icono_luz_digital.ico',
    apple: '/icono_luz_digital.ico',
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Luz Digital",
    title: "Luz Digital - La Palabra en Nueva Luz",
    description: "Una experiencia digital moderna para el creyente de hoy. Sumérgete en la Palabra y el amor de Dios con un diseño inspirador.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luz Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luz Digital - La Palabra en Nueva Luz",
    description: "Una experiencia digital moderna para el creyente de hoy. Sumérgete en la Palabra y el amor de Dios con un diseño inspirador.",
    creator: "@luzdigital",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar aquí los códigos de verificación cuando los tengas
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P133T60M4T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P133T60M4T');
          `}
        </Script>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
