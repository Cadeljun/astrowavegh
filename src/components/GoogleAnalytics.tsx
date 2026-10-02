'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const GA_MEASUREMENT_ID = 'G-HLZ1DFCZ38';
export const GOOGLE_TAG_ID = 'AW-17839484461';
export const BEGIN_CHECKOUT_CONVERSION_ID = 'AW-17839484461/B6cECI2CjNkbEK3cw7pC';

/**
 * Route listener for Google Analytics.
 * Note: The master Google Tag (gtag.js) script is loaded once in <head> inside RootLayout.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Track Begin checkout conversion (Google Ads AW-17839484461)
// Ignores any arguments to prevent React synthetic event objects from being passed
export const trackBeginCheckout = (_event?: any) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', 'conversion', {
        send_to: BEGIN_CHECKOUT_CONVERSION_ID,
      });
    } catch (e) {
      console.warn('gtag conversion tracking error:', e);
    }
  }
};

// Track custom events safely
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    if (typeof action !== 'string') return;
    try {
      (window as any).gtag('event', action, {
        event_category: typeof category === 'string' ? category : undefined,
        event_label: typeof label === 'string' ? label : undefined,
        value: typeof value === 'number' ? value : undefined,
      });
    } catch (e) {
      console.warn('gtag event tracking error:', e);
    }
  }
};

// Track ticket purchase
export const trackTicketPurchase = (ticketType: string, amount: number, quantity: number) => {
  trackBeginCheckout();
  trackEvent('purchase', 'tickets', ticketType, amount);
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'purchase', {
      currency: 'GHS',
      value: amount,
      items: [{
        item_name: `Mask Mirage - ${ticketType}`,
        item_category: 'Tickets',
        quantity: quantity,
        price: amount / (quantity || 1),
      }],
    });
  }
};

// Track page view (for SPA navigation)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};
