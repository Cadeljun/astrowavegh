'use client';

import { useEffect } from 'react';
import { useCMSSettings } from '@/lib/cms/useCMS';

// Default local favicon
const DEFAULT_FAVICON = '/favicon.svg';

/**
 * Real-time favicon injector.
 * Listens to Firestore changes and updates the browser tab icon instantly.
 * Uses local favicon by default; CMS override only if explicitly set to a non-Cloudinary URL.
 */
export default function DynamicFavicon() {
  const { settings } = useCMSSettings();

  useEffect(() => {
    const faviconUrl = settings?.faviconUrl;
    const svgCode = settings?.faviconSvgCode;

    // Use local favicon by default, only override if CMS has a custom non-Cloudinary URL
    let finalUrl = DEFAULT_FAVICON;
    
    // Only use CMS favicon if it's explicitly set and not the old Cloudinary URL
    if (faviconUrl && !faviconUrl.includes('cloudinary.com')) {
      finalUrl = faviconUrl;
    }

    // If we have raw SVG code but no URL, convert to data URI
    if (svgCode) {
      try {
        const base64Svg = btoa(unescape(encodeURIComponent(svgCode)));
        finalUrl = `data:image/svg+xml;base64,${base64Svg}`;
      } catch (e) {
        console.error('Failed to parse SVG favicon code:', e);
      }
    }

    if (!finalUrl) return;
    
    // Update all relevant favicon link tags
    const selectors = [
      'link[rel="icon"]', 
      'link[rel="shortcut icon"]', 
      'link[rel="apple-touch-icon"]'
    ];
    
    selectors.forEach(selector => {
      const links = document.querySelectorAll(selector);
      links.forEach(link => {
        (link as HTMLLinkElement).href = finalUrl!;
      });
      
      // If no tag exists, create a basic one
      if (links.length === 0) {
        const link = document.createElement('link');
        link.rel = selector.includes('apple') ? 'apple-touch-icon' : 'icon';
        link.href = finalUrl!;
        document.head.appendChild(link);
      }
    });
  }, [settings?.faviconUrl, settings?.faviconSvgCode]);

  return null;
}
