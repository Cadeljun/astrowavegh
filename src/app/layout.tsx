
import type { Metadata } from 'next';
import { Bebas_Neue, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'AstroWave | Vibes Beyond the Horizon',
  description: 'AstroWave is a next-generation African entertainment, music, and cultural powerhouse based in Ghana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body className="font-body antialiased bg-black text-white min-h-screen">
        <FirebaseClientProvider>
          <div className="grain-overlay" />
          <main>{children}</main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
