'use client';

import React, { useEffect } from 'react';

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  // Override favicon for scan subdomain
  useEffect(() => {
    const setFavicon = (href: string) => {
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => {
        (link as HTMLLinkElement).href = href;
      });
    };
    setFavicon('/favicon-mm.svg');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {children}
    </div>
  );
}
