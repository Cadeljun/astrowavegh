import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import ClientLayout from '@/components/layout/ClientLayout';
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
  themeColor: '#050E1A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'AstroWave | Africa\'s Entertainment Powerhouse',
  description: 'Connect with elite creative talent and immersive event experiences in Accra, Ghana.',
  icons: {
    icon: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1779674858/ivzvmlaglz9l1hgevktn.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="antialiased bg-dark-bg text-dark-text min-h-screen selection:bg-green selection:text-white">
        <FirebaseClientProvider>
          <AuthProvider>
            <RoleProvider>
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
