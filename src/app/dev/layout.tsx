'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Blocks, Palette, Type, Zap, BarChart3, TableProperties,
  Cloud, Edit3, Image as ImageIcon, Map, Waves, Shuffle,
  Database, Layout, ShieldCheck, ChevronRight, LogOut, Terminal
} from 'lucide-react'
import DevGuard from '@/components/dev/DevGuard'
import { useRole, ROLE_LABELS, ROLE_COLORS } from '@/context/RoleContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

const navItems = [
  { label: 'Overview',        href: '/dev',              icon: Terminal,        group: 'SYSTEM' },
  { label: 'Analytics',       href: '/dev/analytics',    icon: BarChart3,       group: 'SYSTEM', superAdmin: true },
  { label: 'Firestore',       href: '/dev/firestore',    icon: TableProperties, group: 'SYSTEM', superAdmin: true },
  { label: 'Wave Score',      href: '/dev/wave-score',   icon: Waves,           group: 'SYSTEM', superAdmin: true },
  { label: 'Match Engine',    href: '/dev/match-engine', icon: Shuffle,         group: 'SYSTEM', superAdmin: true },
  { label: 'Permissions',     href: '/dev/permissions',  icon: ShieldCheck,     group: 'SYSTEM', superAdmin: true },
  { label: 'Cloudinary',      href: '/dev/cloudinary',   icon: Cloud,           group: 'MEDIA' },
  { label: 'CMS Editor',      href: '/dev/cms',          icon: Edit3,           group: 'CONTENT' },
  { label: 'Brand Assets',    href: '/dev/brand-assets', icon: ImageIcon,       group: 'CONTENT' },
  { label: 'Media Map',       href: '/dev/media-map',    icon: Map,             group: 'CONTENT' },
  { label: 'Seed Database',   href: '/dev/seed',         icon: Database,        group: 'DATA', superAdmin: true },
  { label: 'Previews',        href: '/dev/previews',     icon: Layout,          group: 'PREVIEW' },
  { label: 'Components',      href: '/dev/components',   icon: Blocks,          group: 'LIBRARY' },
  { label: 'Colors',          href: '/dev/colors',       icon: Palette,         group: 'LIBRARY' },
  { label: 'Typography',      href: '/dev/typography',   icon: Type,            group: 'LIBRARY' },
  { label: 'Animations',      href: '/dev/animations',   icon: Zap,             group: 'LIBRARY' },
]

const GROUPS = [
  { key: 'SYSTEM',  label: 'System',  color: '#00FF87' },
  { key: 'MEDIA',   label: 'Media',   color: '#06B6D4' },
  { key: 'CONTENT', label: 'Content', color: '#F97316' },
  { key: 'DATA',    label: 'Data',    color: '#A855F7' },
  { key: 'PREVIEW', label: 'Preview', color: '#38BDF8' },
  { key: 'LIBRARY', label: 'Library', color: '#FFD166' },
]

function SidebarUser() {
  const { user, logout } = useAuth()
  const { role } = useRole()
  if (!user) return null
  return (
    <div className="space-y-3">
      {role && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
          style={{ borderColor: `${(ROLE_COLORS as any)[role]}30` }}>
          <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: (ROLE_COLORS as any)[role] }} />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] font-bold tracking-wider uppercase"
              style={{ color: (ROLE_COLORS as any)[role] }}>
              {(ROLE_LABELS as any)[role]}
            </p>
            <p className="font-mono text-[9px] text-muted/40 truncate">{user.email}</p>
          </div>
        </div>
      )}
      <button onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[10px] text-red-400/50 hover:text-red-400 hover:bg-red-400/8 transition-all w-full text-left uppercase font-bold tracking-widest">
        <LogOut size={12} /> Terminate
      </button>
    </div>
  )
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { canEditCMS, isSuperAdmin } = useRole()
  const isLoginPage = pathname === '/dev/login'
  const isNoAccessPage = pathname === '/dev/no-access'

  if (isLoginPage || isNoAccessPage) {
    return <div className="min-h-screen bg-[#050505]">{children}</div>
  }

  const isActive = (href: string) => pathname === href || (href !== '/dev' && pathname.startsWith(href + '/'))

  const filteredNav = navItems.filter(item => {
    if (item.superAdmin) return isSuperAdmin
    if (item.label === 'CMS Editor') return canEditCMS || isSuperAdmin
    if (item.label === 'Brand Assets') return canEditCMS || isSuperAdmin
    return true
  })

  return (
    <DevGuard>
      <div className="flex min-h-screen bg-[#020B18] text-white">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col sticky top-0 h-screen bg-[#030D1A] z-50 shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Logo height={22} />
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[0.55rem] font-mono font-bold text-green-400/60 tracking-[0.25em] uppercase">Dev Command Center</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
            {GROUPS.map(group => {
              const items = filteredNav.filter(i => i.group === group.key)
              if (!items.length) return null
              return (
                <div key={group.key} className="px-3 mb-1">
                  <p className="px-3 py-2 text-[0.55rem] font-mono font-bold uppercase tracking-[0.25em]"
                    style={{ color: `${group.color}60` }}>
                    {group.label}
                  </p>
                  {items.map(item => (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg font-mono text-[0.7rem] transition-all mb-0.5 group',
                        isActive(item.href)
                          ? 'bg-green-500/10 text-green-400 border-l-2 border-green-400 pl-[10px]'
                          : 'text-muted/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                      )}>
                      <div className="flex items-center gap-2.5">
                        <item.icon size={13} className={cn('transition-colors', isActive(item.href) ? 'text-green-400' : 'text-muted/40 group-hover:text-muted')} />
                        {item.label}
                      </div>
                      {isActive(item.href) && <ChevronRight size={9} className="text-green-400" />}
                    </Link>
                  ))}
                </div>
              )
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <SidebarUser />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto min-w-0"
          style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(0,255,135,0.04), transparent)' }}>
          <div className="max-w-7xl mx-auto p-10">
            {children}
          </div>
        </main>
      </div>
    </DevGuard>
  )
}
