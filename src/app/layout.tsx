'use client';

import React, { useState, useEffect } from 'react';
import { Outfit, Bebas_Neue } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body className="font-body antialiased bg-black text-white min-h-screen">
        <FirebaseClientProvider>
          <AnimatePresence mode="wait">
            {!isLoaded && <LoadingScreen key="loader" />}
          </AnimatePresence>
          
          <Navbar />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <main className="pt-[64px] lg:pt-[72px] min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)]">
              {children}
            </main>
          </motion.div>
          <Footer />
          <ScrollToTop />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
