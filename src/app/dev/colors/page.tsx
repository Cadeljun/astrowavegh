'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

const colorGroups = [
  {
    name: 'Base Colors',
    tokens: [
      { name: 'black', hex: '#050505', css: '--color-black' },
      { name: 'dark', hex: '#0A0A0F', css: '--color-dark' },
      { name: 'surface', hex: '#111118', css: '--color-surface' },
      { name: 'card', hex: '#16161F', css: '--color-card' },
      { name: 'border', hex: '#1E1E2E', css: '--color-border' },
    ]
  },
  {
    name: 'Accent Colors',
    tokens: [
      { name: 'gold', hex: '#FFD166', css: '--color-gold' },
      { name: 'purple', hex: '#A855F7', css: '--color-purple' },
      { name: 'cyan', hex: '#06B6D4', css: '--color-cyan' },
    ]
  },
  {
    name: 'Text Colors',
    tokens: [
      { name: 'white', hex: '#F8F8FF', css: '--color-white' },
      { name: 'muted', hex: '#7B7B9A', css: '--color-muted' },
    ]
  }
];

export default function DevColorsPage() {
  const { toast } = useToast();

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: 'Copied', description: `${val} copied to clipboard.` });
  };

  return (
    <div className="space-y-16">
      {colorGroups.map((group) => (
        <section key={group.name} className="space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-8">{group.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {group.tokens.map((color) => (
              <div key={color.name} className="space-y-3 group">
                <div 
                  className="h-24 w-full rounded-sm border border-white/5 cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Copy size={16} className="text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase">{color.name}</p>
                  <p className="text-[10px] text-muted font-mono">{color.hex}</p>
                  <p className="text-[10px] text-gold font-mono">{color.css}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-6 pt-12 border-t border-white/5">
        <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-8">System Glows</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-sm bg-[#0A0A0F] border border-white/5 flex flex-col items-center gap-4">
             <span className="text-gold text-glow-gold text-2xl font-bold">GOLD GLOW</span>
             <code className="text-[10px] text-muted">.text-glow-gold</code>
          </div>
          <div className="p-8 rounded-sm bg-[#0A0A0F] border border-white/5 flex flex-col items-center gap-4">
             <span className="text-purple text-glow-purple text-2xl font-bold">PURPLE GLOW</span>
             <code className="text-[10px] text-muted">.text-glow-purple</code>
          </div>
          <div className="p-8 rounded-sm bg-[#0A0A0F] border border-white/5 flex flex-col items-center gap-4">
             <span className="text-cyan text-glow-cyan text-2xl font-bold">CYAN GLOW</span>
             <code className="text-[10px] text-muted">.text-glow-cyan</code>
          </div>
        </div>
      </section>
    </div>
  );
}
