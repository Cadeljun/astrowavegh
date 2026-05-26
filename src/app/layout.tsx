import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Outfit, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import ClientLayout from '@/components/layout/ClientLayout';
import { Toaster } from '@/components/ui/toaster';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
});

export const viewport: Viewport = {
  themeColor: '#020B18',
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
    <html lang="en" className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body className="antialiased bg-black text-white min-h-screen">
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