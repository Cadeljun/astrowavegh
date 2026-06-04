'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import {
  LayoutDashboard, Users, Image as ImageIcon, Upload,
  Mail, Bell, FileText, LogOut, ExternalLink, Edit3,
  Terminal, Calendar, BookOpen, Star, BarChart2, Mic,
  ChevronRight, Settings
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Core',
    color: '#FFD166',
    items: [
      { label: 'Dashboard',       href: '/admin/dashboard',        icon: LayoutDashboard },
      { label: 'CMS Content',     href: '/admin/cms',              icon: Edit3 },
      { label: 'Brand & Media',   href: '/dev/brand-assets',       icon: ImageIcon },
    ]
  },
  {
    label: 'Media',
    color: '#06B6D4',
    items: [
      { label: 'Gallery',         href: '/admin/gallery',          icon: ImageIcon },
      { label: 'Uploads',         href: '/admin/uploads',          icon: Upload },
    ]
  },
  {
    label: 'Community',
    color: '#A855F7',
    items: [
      { label: 'Contacts',        href: '/admin/contacts',         icon: Mail },
      { label: 'Waitlist',        href: '/admin/waitlist',         icon: Bell },
      { label: 'Inquiries',       href: '/admin/inquiries',        icon: FileText },
    ]
  },
]

const platformItems = [
  { label: 'Platform Users',     href: '/admin/platform/users',     icon: Users },
  { label: 'Talent Roster',      href: '/admin/platform/talent',    icon: Mic },
  { label: 'Events',             href: '/admin/platform/events',    icon: Calendar },
  { label: 'Bookings',           href: '/admin/platform/bookings',  icon: BookOpen },
  { label: 'Ratings',            href: '/admin/platform/ratings',   icon: Star },
  { label: 'Analytics',          href: '/admin/platform/analytics', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { isSuperAdmin, isDeveloper, canEditCMS } = useRole()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-[260px] min-h-screen flex flex-col bg-[#030B14] border-r border-white/5 sticky top-0">

      {/* Logo */}
      <div className="px-7 py-8 border-b border-white/5">
        <Logo height={28} />
        <p className="text-[0.55rem] font-bold tracking-[0.25em] uppercase text-muted/40 mt-2 font-mono">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-hide space-y-6">

        {/* Core groups */}
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="px-4 mb-2 text-[0.55rem] font-bold uppercase tracking-[0.25em] font-mono"
              style={{ color: `${group.color}50` }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.8rem] font-medium transition-all group border-l-2',
                    isActive(item.href)
                      ? 'bg-yellow-400/8 text-yellow-400 border-yellow-400'
                      : 'text-muted/60 hover:text-white hover:bg-white/5 border-transparent'
                  )}>
                  <item.icon size={15} className={cn(isActive(item.href) ? 'text-yellow-400' : 'text-muted/40 group-hover:text-muted')} />
                  {item.label}
                  {isActive(item.href) && <ChevronRight size={10} className="ml-auto text-yellow-400/60" />}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Platform Control (superAdmin) */}
        {isSuperAdmin && (
          <div>
            <p className="px-4 mb-2 text-[0.55rem] font-bold uppercase tracking-[0.25em] font-mono text-blue-400/50">
              Platform Control
            </p>
            <div className="space-y-0.5">
              {platformItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.8rem] font-medium transition-all group border-l-2',
                    isActive(item.href)
                      ? 'bg-blue-400/8 text-blue-400 border-blue-400'
                      : 'text-muted/60 hover:text-white hover:bg-white/5 border-transparent'
                  )}>
                  <item.icon size={15} className={cn(isActive(item.href) ? 'text-blue-400' : 'text-muted/40 group-hover:text-muted')} />
                  {item.label}
                  {isActive(item.href) && <ChevronRight size={10} className="ml-auto text-blue-400/60" />}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dev Tools */}
        {isDeveloper && (
          <div>
            <p className="px-4 mb-2 text-[0.55rem] font-bold uppercase tracking-[0.25em] font-mono text-green-400/50">
              Dev Tools
            </p>
            <Link href="/dev"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.8rem] font-medium text-green-400/60 hover:text-green-400 hover:bg-green-400/8 transition-all border-l-2 border-transparent group">
              <Terminal size={15} className="text-green-400/40 group-hover:text-green-400" />
              Dev Command Center
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-5 border-t border-white/5 space-y-1 bg-black/30">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.8rem] text-muted/50 hover:text-white hover:bg-white/5 transition-all">
          <ExternalLink size={15} />
          View Live Site
        </Link>
        <button onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[0.8rem] text-red-400/50 hover:text-red-400 hover:bg-red-400/8 transition-all w-full text-left">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
