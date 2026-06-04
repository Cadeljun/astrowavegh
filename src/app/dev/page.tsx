'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Blocks, Palette, Type, Zap, BarChart3, TableProperties,
  Cloud, Edit3, Image as ImageIcon, Map, Waves, Shuffle,
  Database, Layout, ShieldCheck, Activity, Terminal,
  ArrowRight, Users, Calendar, Star
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { getCountFromServer, collection } from 'firebase/firestore';
import { useState } from 'react';
import { useRole } from '@/context/RoleContext';

const TOOLS = [
  { label: 'Components',       href: '/dev/components',  icon: Blocks,          color: '#FFD166', group: 'Library',  desc: 'UI component explorer' },
  { label: 'Colors',           href: '/dev/colors',      icon: Palette,         color: '#F97316', group: 'Library',  desc: 'Brand colour system' },
  { label: 'Typography',       href: '/dev/typography',  icon: Type,            color: '#EC4899', group: 'Library',  desc: 'Font & type scale' },
  { label: 'Animations',       href: '/dev/animations',  icon: Zap,             color: '#A855F7', group: 'Library',  desc: 'Motion presets' },
  { label: 'Analytics',        href: '/dev/analytics',   icon: BarChart3,       color: '#06B6D4', group: 'System',   desc: 'Platform usage stats', superAdmin: true },
  { label: 'Firestore',        href: '/dev/firestore',   icon: TableProperties, color: '#00FF87', group: 'System',   desc: 'DB browser & editor', superAdmin: true },
  { label: 'Cloudinary',       href: '/dev/cloudinary',  icon: Cloud,           color: '#38BDF8', group: 'System',   desc: 'Media asset browser' },
  { label: 'Wave Score',       href: '/dev/wave-score',  icon: Waves,           color: '#FFD166', group: 'System',   desc: 'Score simulator', superAdmin: true },
  { label: 'Match Engine',     href: '/dev/match-engine',icon: Shuffle,         color: '#A855F7', group: 'System',   desc: 'Live matching debugger', superAdmin: true },
  { label: 'CMS Editor',       href: '/dev/cms',         icon: Edit3,           color: '#F97316', group: 'Content',  desc: 'Site content manager' },
  { label: 'Brand Assets',     href: '/dev/brand-assets',icon: ImageIcon,       color: '#EC4899', group: 'Content',  desc: 'Logos & media' },
  { label: 'Media Map',        href: '/dev/media-map',   icon: Map,             color: '#06B6D4', group: 'Content',  desc: 'Asset mapping' },
  { label: 'Seed Database',    href: '/dev/seed',        icon: Database,        color: '#00FF87', group: 'Data',     desc: 'Populate test data', superAdmin: true },
  { label: 'Previews',         href: '/dev/previews',    icon: Layout,          color: '#38BDF8', group: 'Preview',  desc: 'Page preview gallery' },
  { label: 'Permissions',      href: '/dev/permissions', icon: ShieldCheck,     color: '#FFD166', group: 'System',   desc: 'Role & access control', superAdmin: true },
];

const GROUPS = ['Library', 'System', 'Content', 'Data', 'Preview'];

export default function DevCommandCenterPage() {
  const db = useFirestore();
  const { isSuperAdmin, canEditCMS } = useRole();
  const [counts, setCounts] = useState({ talent: 0, events: 0, users: 0, bookings: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [t, e, u, b] = await Promise.all([
          getCountFromServer(collection(db, 'talent_profiles')),
          getCountFromServer(collection(db, 'platform_events')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'bookings')),
        ]);
        setCounts({ talent: t.data().count, events: e.data().count, users: u.data().count, bookings: b.data().count });
      } catch (e) { console.error(e); }
    }
    load();
  }, [db]);

  const visibleTools = TOOLS.filter(t => !t.superAdmin || isSuperAdmin);

  return (
    <div className="space-y-10 max-w-7xl">

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[0.6rem] font-mono font-bold text-green-400/70 uppercase tracking-[0.3em]">
              DEV COMMAND CENTER — LIVE
            </span>
          </div>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wider">
          System Overview
        </h1>
        <p className="text-sm text-muted/60 max-w-lg">
          Full developer access to platform tools, database management, analytics and content systems.
        </p>
      </div>

      {/* Live DB stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Talent Profiles', value: counts.talent,   icon: Users,    color: '#FFD166' },
          { label: 'Platform Events', value: counts.events,   icon: Calendar, color: '#A855F7' },
          { label: 'Registered Users',value: counts.users,    icon: Users,    color: '#06B6D4' },
          { label: 'Bookings',        value: counts.bookings, icon: Star,     color: '#00FF87' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0A1020] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={16} style={{ color: s.color, opacity: 0.5 }} />
              <span className="text-[0.5rem] font-mono text-green-400/50 uppercase">LIVE</span>
            </div>
            <p className="font-display text-3xl text-white leading-none">{s.value}</p>
            <p className="text-[0.55rem] font-bold text-muted uppercase tracking-[0.2em] mt-1">{s.label}</p>
            <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ backgroundColor: `${s.color}20` }} />
          </motion.div>
        ))}
      </div>

      {/* Tool groups */}
      {GROUPS.map(group => {
        const tools = visibleTools.filter(t => t.group === group);
        if (!tools.length) return null;
        return (
          <div key={group} className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-[0.6rem] font-mono font-bold uppercase tracking-[0.25em] text-muted">{group}</p>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[0.55rem] font-mono text-muted/30">{tools.length} tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={tool.href}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0A1020] hover:border-white/12 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${tool.color}12`, color: tool.color }}>
                      <tool.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-white transition-colors truncate">{tool.label}</p>
                      <p className="text-[0.6rem] text-muted/50 truncate">{tool.desc}</p>
                    </div>
                    <ArrowRight size={13} className="text-muted/20 group-hover:text-muted/60 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
