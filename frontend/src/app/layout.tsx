import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CYPY Web | Premium AI Manga Translator SaaS',
    template: '%s | CYPY Web',
  },
  description:
    'Modern AI-powered manga and comic translation engine. Inpainting, OCR, and multi-provider LLM translations.',
  keywords: [
    'Manga Translator',
    'Comic Translation',
    'AI OCR',
    'Inpainting',
    'CYPY',
    'Manga OCR',
    'YOLO ONNX',
  ],
  authors: [{ name: 'CYPY Team' }],
  creator: 'CYPY Web',
  publisher: 'CYPY Web',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cypy.app',
    title: 'CYPY Web - AI Manga Translator',
    description: 'Transform raw manga pages into professionally translated chapters.',
    siteName: 'CYPY Web',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CYPY Web - AI Manga Translator',
    description: 'Transform raw manga pages into professionally translated chapters.',
    creator: '@cypy_web',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} style={{ colorScheme: 'dark' }}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/30 selection:text-primary-foreground">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
