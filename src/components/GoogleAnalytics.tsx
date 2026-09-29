'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-HLZ1DFCZ38';
export const GOOGLE_TAG_ID = 'AW-17839484461';
export const BEGIN_CHECKOUT_CONVERSION_ID = 'AW-17839484461/B6cECI2CjNkbEK3cw7pC';

export default function GoogleAnalytics() {
  return (
    <>
      {/* Single gtag.js loader for Google Tag AW-17839484461 & GA4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_TAG_ID}');
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
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
    // Prevent accidental event objects being passed as action
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
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      currency: 'GHS',
      value: amount,
      items: [{
        item_name: `Mask Mirage - ${ticketType}`,
        item_category: 'Tickets',
        quantity: quantity,
        price: amount / quantity,
      }],
    });
  }
};

// Track page view (for SPA navigation)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};
