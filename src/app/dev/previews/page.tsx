'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Smartphone, Monitor } from 'lucide-react';

const routes = [
  { name: 'Home', path: '/', desc: 'Primary landing page with video hero and ecosystem teasers.', status: 'Complete' },
  { name: 'About', path: '/about', desc: 'Brand story, vision, and mission overview.', status: 'Complete' },
  { name: 'Events', path: '/events', desc: 'Live experience listings with filtering and spotlights.', status: 'Complete' },
  { name: 'Management', path: '/management', desc: 'Talent roster and inquiries portal.', status: 'Complete' },
  { name: 'Records', path: '/records', desc: 'Coming soon landing for music division.', status: 'Complete' },
  { name: 'Cares', path: '/cares', desc: 'Coming soon landing for community division.', status: 'Complete' },
  { name: 'Contact', path: '/contact', desc: 'Communication portal for bookings and general inquiries.', status: 'Complete' },
  { name: 'Admin Login', path: '/admin/login', desc: 'Secure portal for platform administration.', status: 'Protected' },
  { name: 'Dashboard', path: '/admin/dashboard', desc: 'Platform overview and quick management actions.', status: 'Protected' },
  { name: 'Events Manager', path: '/admin/events', desc: 'Full CRUD control for live events.', status: 'Protected' },
  { name: 'Talent Manager', path: '/admin/talent', desc: 'Roster management and artist profiles.', status: 'Protected' },
  { name: 'Gallery Manager', path: '/admin/gallery', desc: 'Past event memory curation hub.', status: 'Protected' },
  { name: 'Uploads Manager', path: '/admin/uploads', desc: 'Centralized media library for Cloudinary assets.', status: 'Protected' },
];

export default function DevPreviewsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <Card key={route.path} className="p-6 bg-[#0A0A0F] border-white/5 flex flex-col justify-between" glowColor="muted">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">{route.name}</h4>
              <Badge variant={route.status === 'Protected' ? 'coming-soon' : 'active'} className="text-[9px]">
                {route.status}
              </Badge>
            </div>
            <code className="text-[11px] text-gold font-mono block bg-black/40 p-1 rounded-sm w-fit">{route.path}</code>
            <p className="text-[11px] text-muted leading-relaxed">{route.desc}</p>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-3">
             <Button variant="secondary" size="sm" className="h-9 border-white/5" onClick={() => window.open(route.path, '_blank')}>
                <Monitor size={12} className="mr-2" /> DESKTOP
             </Button>
             <Button variant="ghost" size="sm" className="h-9 border border-white/5" onClick={() => window.open(`${route.path}?preview=mobile`, '_blank')}>
                <Smartphone size={12} className="mr-2" /> MOBILE
             </Button>
          </div>
        </Card>
      ))}

      <Card className="p-6 bg-[#0A0A0F] border-dashed border-white/20 border-2 flex flex-col items-center justify-center text-center space-y-3">
         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ExternalLink size={16} className="text-muted" />
         </div>
         <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Custom 404 Preview</p>
         <Button variant="ghost" size="sm" onClick={() => window.open('/non-existent-page', '_blank')}>TEST 404 PAGE</Button>
      </Card>
    </div>
  );
}
