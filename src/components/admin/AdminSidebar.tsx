'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Upload,
  Mail,
  Bell,
  FileText,
  LogOut,
  ExternalLink,
  Edit3,
  Terminal,
  Calendar,
  BookOpen,
  Star,
  BarChart2,
  Mic
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, group: 'CORE' },
  { label: 'CMS Content', href: '/admin/cms', icon: Edit3, group: 'CORE' },
  { label: 'Media & Branding', href: '/dev/brand-assets', icon: ImageIcon, group: 'CORE' },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon, group: 'MEDIA' },
  { label: 'Uploads', href: '/admin/uploads', icon: Upload, group: 'MEDIA' },
  { label: 'Contacts', href: '/admin/contacts', icon: Mail, group: 'COMMUNITY' },
  { label: 'Waitlist', href: '/admin/waitlist', icon: Bell, group: 'COMMUNITY' },
  { label: 'Inquiries', href: '/admin/inquiries', icon: FileText, group: 'COMMUNITY' }
]

const platformItems = [
  { label: 'Platform Users', href: '/admin/platform/users', icon: Users },
  { label: 'Talent Roster', href: '/admin/platform/talent', icon: Mic },
  { label: 'Events', href: '/admin/platform/events', icon: Calendar },
  { label: 'Bookings', href: '/admin/platform/bookings', icon: BookOpen },
  { label: 'Ratings', href: '/admin/platform/ratings', icon: Star },
  { label: 'Analytics', href: '/admin/platform/analytics', icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { isSuperAdmin, isDeveloper } = useRole()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-[280px] min-h-screen flex flex-col bg-[#030B14] border-r border-dark-border sticky top-0">
      <div className="px-8 py-10 border-b border-dark-border">
        <Logo height={32} />
        <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase text-dark-muted mt-3 font-bold">
          Platform Protocol
        </p>
      </div>

      <nav className="flex-1 px-4 py-8 flex flex-col gap-8 overflow-y-auto scrollbar-hide">
        <div>
          <p className="px-4 mb-4 font-body text-[0.65rem] text-dark-muted font-bold uppercase tracking-[0.2em]">Management</p>
          <div className="flex flex-col gap-1.5">
            {navItems.filter(i => i.group === 'CORE' || i.group === 'MEDIA').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-sm font-body text-[0.85rem] font-medium transition-all duration-200 border-l-3 border-transparent",
                  isActive(item.href) 
                    ? "bg-green-bg-dark text-green border-green" 
                    : "text-dark-subtext hover:text-white hover:bg-dark-hover"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {isSuperAdmin && (
          <div>
            <p className="px-4 mb-4 font-body text-[0.65rem] text-blue font-bold uppercase tracking-[0.2em]">Platform Control</p>
            <div className="flex flex-col gap-1.5">
              {platformItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-sm font-body text-[0.85rem] font-medium transition-all duration-200 border-l-3 border-transparent",
                    isActive(item.href) 
                      ? "bg-blue-bg-dark text-blue border-blue" 
                      : "text-dark-subtext hover:text-white hover:bg-dark-hover"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {isDeveloper && (
          <div>
            <p className="px-4 mb-4 font-body text-[0.65rem] text-cyan font-bold uppercase tracking-[0.2em]">System Tools</p>
            <Link
              href="/dev"
              className="flex items-center gap-3 px-4 py-3 rounded-sm font-body text-[0.85rem] font-medium text-cyan hover:bg-cyan-bg-dark transition-all"
            >
              <Terminal size={18} />
              Dev Command Center
            </Link>
          </div>
        )}
      </nav>

      <div className="px-4 py-6 border-t border-dark-border space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-sm font-body text-[0.85rem] text-dark-subtext hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={18} />
          View Live Site
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-sm font-body text-[0.85rem] text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
