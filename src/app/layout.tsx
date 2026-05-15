
'use client';

import React, { useState, useEffect } from 'react';
import { Outfit, Bebas_Neue } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { usePathname } from 'next/navigation';
import { useCMSSettings } from '@/lib/cms/use-cms';

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

function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-[5rem] md:text-[8rem] text-gold text-glow-gold tracking-widest uppercase leading-none mb-4"
      >
        ASTROWAVE
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-body text-xl text-white uppercase tracking-[0.3em] mb-2"
      >
        We'll be right back.
      </motion.p>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-body italic text-muted"
      >
        Vibes Beyond the Horizon.
      </motion.p>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/dev');
  const settings = useCMSSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const isMaintenance = settings?.maintenanceMode && !isAdminRoute;

  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body className="font-body antialiased bg-black text-white min-h-screen">
        <FirebaseClientProvider>
          <AuthProvider>
            <AnimatePresence mode="wait">
              {!isLoaded && <LoadingScreen key="loader" />}
            </AnimatePresence>
            
            {isMaintenance ? (
              <MaintenancePage />
            ) : (
              <>
                {!isAdminRoute && <Navbar />}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <main className={!isAdminRoute ? "pt-[64px] lg:pt-[72px] min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)]" : ""}>
                    {children}
                  </main>
                </motion.div>
                {!isAdminRoute && <Footer />}
                {!isAdminRoute && <ScrollToTop />}
              </>
            )}
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
