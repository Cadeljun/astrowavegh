'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import {
  LayoutDashboard,
  Zap,
  Users,
  Image,
  Upload,
  Mail,
  Bell,
  FileText,
  LogOut,
  ExternalLink,
  Edit3,
  Terminal,
  BarChart3,
  Mic,
  Calendar,
  BookOpen,
  Star,
  BarChart2
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    group: 'CORE'
  },
  {
    label: 'CMS Content',
    href: '/admin/cms',
    icon: Edit3,
    group: 'CORE'
  },
  {
    label: 'Gallery',
    href: '/admin/gallery',
    icon: Image,
    group: 'MEDIA'
  },
  {
    label: 'Uploads',
    href: '/admin/uploads',
    icon: Upload,
    group: 'MEDIA'
  },
  {
    label: 'Contacts',
    href: '/admin/contacts',
    icon: Mail,
    group: 'COMMUNITY'
  },
  {
    label: 'Waitlist',
    href: '/admin/waitlist',
    icon: Bell,
    group: 'COMMUNITY'
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: FileText,
    group: 'COMMUNITY'
  }
]

const platformItems = [
  { label: 'Platform Users', href: '/admin/platform/users', icon: Users },
  { label: 'Talent Roster', href: '/admin/platform/talent', icon: Mic },
  { label: 'Events', href: '/admin/platform/events', icon: Calendar },
  { label: 'Bookings', href: '/admin/platform/bookings', icon: BookOpen },
  { label: 'Ratings', href: '/admin/platform/ratings', icon: Star },
  { label: 'Platform Analytics', href: '/admin/platform/analytics', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { isSuperAdmin, isDeveloper } = useRole()

  const isActive = (href: string) =>
    pathname === href || 
    pathname.startsWith(href + '/')

  return (
    <aside className="w-[260px] min-h-screen flex flex-col bg-[#0A0A0F] border-r border-[#1E1E2E] sticky top-0">
      <div className="px-6 py-6 border-b border-[#1E1E2E]">
        <h1 className="font-display text-2xl text-[#FFD166]" style={{ textShadow: '0 0 20px rgba(255,209,102,0.4)' }}>
          ASTROWAVE
        </h1>
        <p className="font-body text-xs tracking-[0.2em] uppercase text-[#7B7B9A] mt-1">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {/* Core Group */}
        <div>
          <p className="px-3 mb-2 font-mono text-[0.6rem] text-[#7B7B9A] uppercase tracking-[0.2em]">Core Management</p>
          <div className="flex flex-col gap-1">
            {navItems.filter(i => i.group === 'CORE' || i.group === 'MEDIA').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium transition-all duration-200 ${isActive(item.href) ? 'bg-[rgba(255,209,102,0.1)] text-[#FFD166] border-l-[3px] border-[#FFD166] pl-[9px]' : 'text-[#7B7B9A] hover:text-[#F8F8FF] hover:bg-[rgba(255,255,255,0.04)] border-l-[3px] border-transparent'}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Group (Super Admin Only) */}
        {isSuperAdmin && (
          <div>
            <p className="px-3 mb-2 font-mono text-[0.6rem] text-cyan-400 uppercase tracking-[0.2em]">Platform Control</p>
            <div className="flex flex-col gap-1">
              {platformItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium transition-all duration-200 ${isActive(item.href) ? 'bg-cyan-500/10 text-cyan-400 border-l-[3px] border-cyan-400 pl-[9px]' : 'text-[#7B7B9A] hover:text-cyan-400 hover:bg-cyan-500/5 border-l-[3px] border-transparent'}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Community Group */}
        <div>
          <p className="px-3 mb-2 font-mono text-[0.6rem] text-purple-400 uppercase tracking-[0.2em]">Community</p>
          <div className="flex flex-col gap-1">
            {navItems.filter(i => i.group === 'COMMUNITY').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium transition-all duration-200 ${isActive(item.href) ? 'bg-purple-500/10 text-purple-400 border-l-[3px] border-purple-400 pl-[9px]' : 'text-[#7B7B9A] hover:text-[#F8F8FF] hover:bg-[rgba(255,255,255,0.04)] border-l-[3px] border-transparent'}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {isDeveloper && (
          <Link
            href="/dev"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all duration-200 mt-2`}
          >
            <Terminal size={18} />
            Dev Panel
          </Link>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-[#1E1E2E] flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium text-[#7B7B9A] hover:text-[#F8F8FF] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
        >
          <ExternalLink size={18} />
          View Site
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-sm font-medium text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-300 transition-all duration-200 w-full text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
