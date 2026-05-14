'use client';

import React from 'react';

const styles = [
  { className: 'display-2xl', label: 'Display 2XL (Hero)', desc: 'Bebas Neue | Fluid Size | 400' },
  { className: 'display-xl', label: 'Display XL (Page Title)', desc: 'Bebas Neue | Fluid Size | 400' },
  { className: 'display-lg', label: 'Display Large', desc: 'Bebas Neue | Fluid Size | 400' },
  { className: 'display-md', label: 'Display Medium', desc: 'Bebas Neue | Fluid Size | 400' },
  { className: 'body-lg', label: 'Body Large', desc: 'Outfit | 1.2rem | 300' },
  { className: 'body-md', label: 'Body Medium (Default)', desc: 'Outfit | 1rem | 300' },
  { className: 'label', label: 'System Label', desc: 'Outfit | 0.75rem | 600 | 0.2em Tracking' },
];

export default function DevTypographyPage() {
  return (
    <div className="space-y-16">
      {styles.map((style) => (
        <section key={style.className} className="space-y-4 pb-12 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] text-gold uppercase font-bold tracking-widest">{style.label}</p>
            <code className="text-[10px] text-muted">.{style.className}</code>
          </div>
          
          <div className={style.className}>
            AstroWave: Vibes Beyond the Horizon.
          </div>

          <p className="text-[10px] text-muted mt-4 opacity-60 italic">{style.desc}</p>
        </section>
      ))}

      <section className="pt-8 space-y-12">
        <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-8">Weight Comparison (Outfit)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="font-light text-white text-3xl">Outfit Light (300)</p>
            <p className="font-normal text-white text-3xl">Outfit Normal (400)</p>
            <p className="font-medium text-white text-3xl">Outfit Medium (500)</p>
            <p className="font-bold text-white text-3xl">Outfit Bold (600)</p>
          </div>
          <div className="bg-[#0A0A0F] p-8 rounded-sm border border-white/5">
            <p className="label mb-4">Sample Paragraph</p>
            <p className="body-md text-muted leading-relaxed">
              Africa's next-generation creative entertainment powerhouse. We exist where music, culture, and ambition collide. Born in Accra, built for Africa, destined for the world. AstroWave is more than a brand—it's a movement defined by authentic sound and immersive experiences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
