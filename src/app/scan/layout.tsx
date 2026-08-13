'use client';

import React, { useEffect } from 'react';

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  // Override favicon for scan subdomain
  useEffect(() => {
    const setFavicon = () => {
      // Remove existing favicons
      document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
      
      // Add MM favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = '/favicon-mm.png';
      document.head.appendChild(link);
    };
    setFavicon();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {children}
    </div>
  );
}
