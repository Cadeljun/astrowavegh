import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import ClientLayout from '@/components/layout/ClientLayout';
import DynamicFavicon from '@/components/ui/DynamicFavicon';
import { Toaster } from '@/components/ui/toaster';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap'
});

export const viewport: Viewport = {
  themeColor: '#00C853',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://astrowavegh.com'),
  title: {
    default: 'AstroWave | Ghana\'s Entertainment Powerhouse',
    template: '%s | AstroWave',
  },
  description: 'Ghana\'s premier entertainment platform for events, nightlife, talent management, and creative culture in Accra. Find, book, and rate creative talent with AI-powered matching.',
  keywords: ['AstroWave', 'Ghana events', 'Accra nightlife', 'talent management', 'DJ booking', 'MC booking', 'event planning Ghana', 'African entertainment', 'creative talent', 'Wave Score'],
  authors: [{ name: 'AstroWave', url: 'https://astrowavegh.com' }],
  creator: 'AstroWave',
  publisher: 'AstroWave',
  alternates: {
    canonical: 'https://astrowavegh.com',
  },
  openGraph: {
    title: 'AstroWave | Ghana\'s Entertainment Powerhouse',
    description: 'Ghana\'s premier entertainment platform for events, nightlife, talent management, and creative culture in Accra.',
    url: 'https://astrowavegh.com',
    siteName: 'AstroWave',
    locale: 'en_GH',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'AstroWave — Vibes Beyond the Horizon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroWave | Ghana\'s Entertainment Powerhouse',
    description: 'Ghana\'s premier entertainment platform for events, nightlife, talent management, and creative culture in Accra.',
    images: ['/opengraph-image'],
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
  icons: {
    icon: [
      { url: '/favicon-awe.svg', type: 'image/svg+xml' },
      { url: '/favicon-awe.png', type: 'image/png' },
      { url: '/favicon-awe.ico', sizes: 'any' },
    ],
    apple: '/favicon-awe.png',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AstroWave',
  alternateName: 'AstroWave Ghana',
  url: 'https://astrowavegh.com',
  logo: 'https://astrowavegh.com/logo/astrowave-logo.png',
  description: 'Ghana\'s premier entertainment platform for events, nightlife, talent management, and creative culture in Accra.',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Calvin Mensah Delali',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Accra',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'astrowaveevent@gmail.com',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AstroWave',
  url: 'https://astrowavegh.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://astrowavegh.com/events?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  name: 'AstroWave',
  image: 'https://astrowavegh.com/logo/astrowave-logo.png',
  url: 'https://astrowavegh.com',
    email: 'astrowaveevent@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Accra',
    addressRegion: 'Greater Accra',
    addressCountry: 'GH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 5.6037,
    longitude: -0.1870,
  },
  priceRange: '$$',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <body className="antialiased bg-white text-[#0B1F14] min-h-screen selection:bg-[#00C853]/20 selection:text-[#0B1F14]">
        <FirebaseClientProvider>
          <AuthProvider>
            <RoleProvider>
              <DynamicFavicon />
              <ClientLayout>
                {children}
              </ClientLayout>
              <Toaster />
            </RoleProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
