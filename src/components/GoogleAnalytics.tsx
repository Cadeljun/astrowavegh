'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-HLZ1DFCZ38';

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track ticket purchase
export const trackTicketPurchase = (ticketType: string, amount: number, quantity: number) => {
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
    (window as any).gtag('config', 'G-HLZ1DFCZ38', {
      page_path: url,
    });
  }
};
