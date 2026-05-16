import React from 'react';
import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://astrowave.com'),
  title: {
    default: 'AstroWave | Events, Nightlife & Talent in Accra, Ghana',
    template: '%s | AstroWave Ghana',
  },
  description:
    "AstroWave is Ghana's premier youth entertainment brand. Discover the best events, nightlife experiences, and creative talent in Accra. Vibes Beyond the Horizon.",
  keywords: [
    'AstroWave',
    'AstroWave Ghana',
    'events in Accra',
    'Accra nightlife',
    'Ghana events 2025',
    'parties in Accra',
    'Accra parties',
    'nightlife Accra Ghana',
    'events Ghana',
    'Mask Mirage Accra',
    'Splash and Seduction Ghana',
    'pool party Accra',
    'African entertainment',
    'talent management Ghana',
    'DJ Ghana',
    'music events Accra',
    'youth events Ghana',
    'creative events Accra',
    'Calvin Mensah Delali',
    'Uzy AstroWave',
    'nightlife in Osu Accra',
    'parties in Labadi',
    'events in Cantonments Accra',
    'East Legon parties',
    'Airport Residential area events',
    'Ghana party scene 2025',
    'Accra weekend vibes',
    'things to do in Accra at night',
    'Accra social scene',
    'Ghana entertainment news',
    'masked party Accra',
    'pool party Ghana',
    'day party Accra',
    'sunset vibes Ghana',
    'after party Accra',
    'club events Accra',
    'concert Accra',
    'festival Ghana',
    'new year eve Accra 2025',
    'Christmas parties Ghana',
    'best DJs in Accra',
    'Ghana DJ booking',
    'artist management Ghana',
    'event DJs Accra',
    'corporate events Ghana',
    'wedding DJs Ghana',
    'music producer Accra',
    'Ghana creative industry',
    'entertainment companies Ghana',
    'booking agency Accra',
    'youth entertainment Ghana',
    'Gen Z events Accra',
    'millennial nightlife Ghana',
    'African youth culture',
    'creative community Ghana',
    'Ghanaian pop culture',
    'streetwear events Accra',
    'urban culture Ghana',
    'Afrobeats party Accra',
    'Amapiano events Ghana',
    'where to party in Accra tonight',
    'best clubs in Accra Ghana',
    'how to book a DJ in Ghana',
    "what's happening in Accra this weekend",
    'events in Accra for young adults',
    'best nightlife experiences Ghana',
    'top event planners Accra',
    'affordable party venues Accra',
    'luxury events Ghana',
    'birthday party ideas Accra',
    'Cadel AstroWave',
    'Calvin Mensah Delali',
    'AstroWave Mask Mirage',
    'AstroWave Splash and Seduction',
    'AstroWave management roster',
    'AstroWave Accra office',
    'Cadel',
    'Who is Cadel',
    'Biggest Party In Ghana',
  ],
  authors: [{ name: 'Calvin Mensah Delali' }],
  creator: 'AstroWave',
  publisher: 'AstroWave',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: 'https://astrowave.com',
    siteName: 'AstroWave Ghana',
    title: 'AstroWave | Events & Nightlife in Accra, Ghana',
    description:
      "Ghana's next-generation entertainment brand. Immersive events, nightlife, and creative talent in Accra. Vibes Beyond the Horizon.",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'AstroWave — Vibes Beyond the Horizon — Accra, Ghana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@astrowavegh',
    creator: '@astrowavegh',
    title: 'AstroWave | Events & Nightlife in Accra',
    description: "Ghana's next-generation entertainment brand. Immersive events and nightlife in Accra.",
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
  alternates: {
    canonical: 'https://astrowave.com',
    languages: {
      'en-GH': 'https://astrowave.com',
      'en-US': 'https://astrowave.com',
    },
  },
  verification: {
    google: 'PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_CODE_HERE',
  },
  category: 'entertainment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="alternate" hrefLang="en-gh" href="https://astrowave.com" />
        <link rel="alternate" hrefLang="en" href="https://astrowave.com" />
        <link rel="alternate" hrefLang="x-default" href="https://astrowave.com" />
        
        <SchemaOrg
          schema={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AstroWave',
            alternateName: 'AstroWave Ghana',
            url: 'https://astrowave.com',
            logo: 'https://astrowave.com/logo.png',
            description:
              "Ghana's next-generation creative entertainment brand — events, nightlife, talent management and music in Accra.",
            foundingDate: '2024',
            founder: {
              '@type': 'Person',
              name: 'Calvin Mensah Delali',
              alternateName: 'Uzy',
              jobTitle: 'Founder & CEO',
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
              email: 'info@astrowave.com',
              availableLanguage: 'English',
            },
            sameAs: [
              'https://instagram.com/astrowavegh',
              'https://twitter.com/astrowavegh',
              'https://tiktok.com/@astrowavegh',
              'https://youtube.com/@astrowavegh',
              'https://facebook.com/astrowavegh',
            ],
          }}
        />

        <SchemaOrg
          schema={{
            '@context': 'https://schema.org',
            '@type': 'EntertainmentBusiness',
            name: 'AstroWave',
            image: 'https://astrowave.com/og-image.jpg',
            url: 'https://astrowave.com',
            telephone: '+233-XX-XXX-XXXX',
            email: 'info@astrowave.com',
            description:
              "Ghana's leading youth entertainment brand. Immersive events, nightlife, talent management and creative culture in Accra.",
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Accra',
              addressLocality: 'Accra',
              addressRegion: 'Greater Accra',
              addressCountry: 'GH',
              postalCode: '00233',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: '5.6037',
              longitude: '-0.1870',
            },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              opens: '09:00',
              closes: '23:00',
            },
            priceRange: '$$',
            currenciesAccepted: 'GHS, USD',
            paymentAccepted: 'Cash, Mobile Money',
            areaServed: {
              '@type': 'City',
              name: 'Accra',
            },
            hasMap: 'https://maps.google.com/?q=Accra,Ghana',
          }}
        />

        <SchemaOrg
          schema={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'AstroWave',
            url: 'https://astrowave.com',
            description: "Ghana's next-generation entertainment brand",
            inLanguage: 'en-GH',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://astrowave.com/events?search={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
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
