'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/organizer') || pathname?.startsWith('/talent') || pathname?.startsWith('/admin') || pathname?.startsWith('/dev');
  const isAuth = pathname?.startsWith('/auth');

  if (isPortal || isAuth) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 lg:pt-0">
        {children}
      </main>
      <Footer />
    </>
  );
}