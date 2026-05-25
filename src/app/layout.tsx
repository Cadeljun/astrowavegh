import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import ClientLayout from '@/components/layout/ClientLayout';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const FAVICON_URL = 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png';

export const viewport: Viewport = {
  themeColor: '#020B18',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://astrowave.com'),
  title: {
    default: 'AstroWave | Events, Nightlife & Talent in Accra, Ghana',
    template: '%s | AstroWave Ghana',
  },
  description: "AstroWave is Ghana's premier youth entertainment brand. Discover the best events, nightlife experiences, and creative talent in Accra.",
  keywords: [
    'AstroWave',
    'AstroWave Ghana',
    'events in Accra',
    'Accra nightlife',
    'Ghana events 2025',
    'talent management Ghana',
    'African entertainment'
  ],
  authors: [{ name: 'Calvin Mensah Delali' }],
  creator: 'AstroWave',
  publisher: 'AstroWave',
  icons: {
    icon: [
      { url: FAVICON_URL, type: 'image/png' },
    ],
    shortcut: FAVICON_URL,
    apple: [
      { url: FAVICON_URL, sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Explicitly defined head links to help some browsers override cache */}
        <link rel="icon" href={FAVICON_URL} type="image/png" sizes="any" />
        <link rel="shortcut icon" href={FAVICON_URL} type="image/png" />
        <link rel="apple-touch-icon" href={FAVICON_URL} />
        
        <SchemaOrg
          schema={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AstroWave',
            url: 'https://astrowave.com',
            logo: 'https://astrowave.com/logo.png',
            foundingDate: '2024',
          }}
        />
      </head>
      <body className="font-body antialiased bg-black text-white min-h-screen">
        <FirebaseClientProvider>
          <AuthProvider>
            <RoleProvider>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </RoleProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
