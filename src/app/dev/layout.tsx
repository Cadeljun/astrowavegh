'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Blocks,
  Palette,
  Type,
  Zap,
  Flame,
  Cloud,
  Database,
  Layout,
  Edit3,
  ShieldCheck,
  LogOut,
  Terminal as TerminalIcon,
  ChevronRight,
  Map,
  TableProperties,
  Waves
} from 'lucide-react'
import DevGuard from '@/components/dev/DevGuard'
import { useRole, ROLE_LABELS, ROLE_COLORS } from '@/context/RoleContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Components', href: '/dev/components', icon: Blocks, group: 'LIBRARY' },
  { label: 'Colors', href: '/dev/colors', icon: Palette, group: 'LIBRARY' },
  { label: 'Typography', href: '/dev/typography', icon: Type, group: 'LIBRARY' },
  { label: 'Animations', href: '/dev/animations', icon: Zap, group: 'LIBRARY' },
  { label: 'Firestore Manager', href: '/dev/firestore', icon: TableProperties, group: 'SYSTEM' },
  { label: 'Cloudinary Browser', href: '/dev/cloudinary', icon: Cloud, group: 'SYSTEM' },
  { label: 'Media Map', href: '/dev/media-map', icon: Map, group: 'CONTENT' },
  { label: 'Wave Score', href: '/dev/wave-score', icon: Waves, group: 'SYSTEM' },
  { label: 'CMS Editor', href: '/dev/cms', icon: Edit3, group: 'CONTENT' },
  { label: 'Seed Database', href: '/dev/seed', icon: Database, group: 'DATA' },
  { label: 'Page Previews', href: '/dev/previews', icon: Layout, group: 'PREVIEW' },
  { label: 'Permissions', href: '/dev/permissions', icon: ShieldCheck, group: 'SYSTEM' }
]

function SidebarUser() {
  const { user, logout } = useAuth()
  const { role } = useRole()
  if (!user) return null
  return (
    <div className="flex flex-col gap-3">
      {role && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5" style={{ borderColor: `${(ROLE_COLORS as any)[role]}40` }}>
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: (ROLE_COLORS as any)[role], color: (ROLE_COLORS as any)[role] }} />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] font-bold tracking-tighter" style={{ color: (ROLE_COLORS as any)[role] }}>{(ROLE_LABELS as any)[role]}</p>
            <p className="font-mono text-[9px] text-muted truncate">{user.email}</p>
          </div>
        </div>
      )}
      <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-md font-mono text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all w-full text-left uppercase font-bold tracking-widest"><LogOut size={12} /> Terminate Session</button>
    </div>
  )
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { canEditCMS, isSuperAdmin } = useRole()
  const isLoginPage = pathname === '/dev/login'
  const isNoAccessPage = pathname === '/dev/no-access'

  if (isLoginPage || isNoAccessPage) return <div className="min-h-screen bg-[#050505]">{children}</div>

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'CMS Editor') return canEditCMS;
    if (item.label === 'Seed Database' || item.label === 'Firestore Manager' || item.label === 'Wave Score') return isSuperAdmin;
    return true;
  });

  return (
    <DevGuard>
      <div className="flex min-h-screen bg-[#050505] text-white">
        <aside className="w-72 border-r border-white/5 flex flex-col sticky top-0 h-screen bg-[#08080C] z-[100]">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"><TerminalIcon size={16} /></div>
              <span className="font-display text-2xl text-gold tracking-tight">ASTROWAVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <p className="text-[0.6rem] font-mono text-cyan-500/60 tracking-[0.2em] uppercase font-bold">DEV COMMAND CENTER</p>
            </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn("flex items-center justify-between px-4 py-2.5 rounded-md font-mono text-[0.7rem] transition-all group uppercase tracking-wider", isActive(item.href) ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 pl-[14px]" : "text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent")}>
                <div className="flex items-center gap-3"><item.icon size={14} className={cn("transition-transform group-hover:scale-110", isActive(item.href) ? "text-cyan-400" : "text-muted")} />{item.label}</div>
                {isActive(item.href) && <ChevronRight size={10} className="text-cyan-400" />}
              </Link>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5 bg-black/40"><SidebarUser /></div>
        </aside>
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.05),transparent)]">
          <div className="max-w-6xl mx-auto p-12">{children}</div>
        </main>
      </div>
    </DevGuard>
  )
}
