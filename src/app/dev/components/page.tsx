'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Divider } from '@/components/ui/Divider';
import { NeonLine } from '@/components/ui/NeonLine';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DevComponentsPage() {
  const { toast } = useToast();

  const sectionStyle = "space-y-6 mb-16 p-8 rounded-md bg-[#0A0A0F] border border-white/5";
  const labelStyle = "text-xs font-bold text-gold/60 uppercase tracking-widest mb-4 block";

  return (
    <div className="space-y-12">
      {/* BUTTONS */}
      <section className={sectionStyle}>
        <span className={labelStyle}>Buttons (variants & sizes)</span>
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-4">
            <p className="text-[10px] text-muted">Primary</p>
            <div className="flex items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] text-muted">Secondary</p>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm">Small</Button>
              <Button variant="secondary" size="md">Medium</Button>
              <Button variant="secondary" size="lg">Large</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] text-muted">Ghost</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Small</Button>
              <Button variant="ghost" size="md">Medium</Button>
              <Button variant="ghost" size="lg">Large</Button>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 flex gap-6">
          <Button disabled>Disabled Button</Button>
          <Button><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading State</Button>
        </div>
      </section>

      {/* BADGES */}
      <section className={sectionStyle}>
        <span className={labelStyle}>Badges</span>
        <div className="flex flex-wrap gap-4">
          <Badge variant="active">Active</Badge>
          <Badge variant="live">Live Now</Badge>
          <Badge variant="coming-soon">Coming Soon</Badge>
          <Badge variant="free">Free Access</Badge>
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-sm border border-white/5">
             <span className="text-[10px] text-muted mr-2">Roles:</span>
             <Badge variant="active" className="bg-purple-dim text-purple border-purple">DJ</Badge>
             <Badge variant="active" className="bg-gold-dim text-gold border-gold">Artist</Badge>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className={sectionStyle}>
        <span className={labelStyle}>Cards & Glows</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6" glowColor="gold">
            <h4 className="font-bold text-white mb-2">Gold Glow</h4>
            <p className="text-xs text-muted">Base card with interactive gold glow effect.</p>
          </Card>
          <Card className="p-6" glowColor="purple">
            <h4 className="font-bold text-white mb-2">Purple Glow</h4>
            <p className="text-xs text-muted">Division-specific purple thematic glow.</p>
          </Card>
          <Card className="p-6" glowColor="cyan">
            <h4 className="font-bold text-white mb-2">Cyan Glow</h4>
            <p className="text-xs text-muted">Highlighting accent cyan glow variant.</p>
          </Card>
        </div>
      </section>

      {/* TOASTS */}
      <section className={sectionStyle}>
        <span className={labelStyle}>Toast Notifications</span>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" onClick={() => toast({ title: "Success", description: "Operation completed." })}>
            Trigger Success
          </Button>
          <Button variant="secondary" onClick={() => toast({ variant: "destructive", title: "Error", description: "Critical system failure." })}>
            Trigger Error
          </Button>
        </div>
      </section>

      {/* SECTION ELEMENTS */}
      <section className={sectionStyle}>
        <span className={labelStyle}>Section Components</span>
        <div className="space-y-8 bg-black/20 p-8 rounded-sm">
          <SectionLabel>Label Example</SectionLabel>
          <SectionHeading title="Component Heading" subtitle="Subtitle description for dev preview." />
          <Divider />
          <div className="flex items-center gap-12">
            <div className="space-y-2">
               <p className="text-[10px] text-muted">Neon Vertical</p>
               <div className="flex gap-4">
                 <NeonLine orientation="vertical" color="gold" length="40px" />
                 <NeonLine orientation="vertical" color="purple" length="40px" />
                 <NeonLine orientation="vertical" color="cyan" length="40px" />
               </div>
            </div>
            <div className="flex-1 space-y-2">
               <p className="text-[10px] text-muted">Neon Horizontal</p>
               <NeonLine orientation="horizontal" color="gold" length="100%" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
