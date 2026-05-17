'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
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
  Terminal
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'CMS Content',
    href: '/admin/cms',
    icon: Edit3
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: Zap
  },
  {
    label: 'Talent',
    href: '/admin/talent',
    icon: Users
  },
  {
    label: 'Gallery',
    href: '/admin/gallery',
    icon: Image
  },
  {
    label: 'Uploads',
    href: '/admin/uploads',
    icon: Upload
  },
  {
    label: 'Contacts',
    href: '/admin/contacts',
    icon: Mail
  },
  {
    label: 'Waitlist',
    href: '/admin/waitlist',
    icon: Bell
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: FileText
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user, isDeveloper } = useAuth()

  const isActive = (href: string) =>
    pathname === href || 
    pathname.startsWith(href + '/')

  return (
    <aside className="w-[260px] 
      min-h-screen flex flex-col
      bg-[#0A0A0F]
      border-r border-[#1E1E2E]
      sticky top-0">

      {/* Logo */}
      <div className="px-6 py-6 
        border-b border-[#1E1E2E]">
        <h1 className="font-display 
          text-2xl text-[#FFD166]"
          style={{
            textShadow: '0 0 20px rgba(255,209,102,0.4)'
          }}
        >
          ASTROWAVE
        </h1>
        <p className="font-body text-xs 
          tracking-[0.2em] uppercase 
          text-[#7B7B9A] mt-1">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 
        flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3
                px-3 py-2.5 rounded-md
                font-body text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-[rgba(255,209,102,0.1)] text-[#FFD166] border-l-[3px] border-[#FFD166] pl-[9px]'
                  : 'text-[#7B7B9A] hover:text-[#F8F8FF] hover:bg-[rgba(255,255,255,0.04)] border-l-[3px] border-transparent'
                }
              `}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}

        {isDeveloper && (
          <Link
            href="/dev"
            className={`
              flex items-center gap-3
              px-3 py-2.5 rounded-md
              font-body text-sm font-medium
              text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-400/5
              transition-all duration-200 mt-4
            `}
          >
            <Terminal size={18} />
            Dev Panel
          </Link>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 
        border-t border-[#1E1E2E]
        flex flex-col gap-2">
        
        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3
            px-3 py-2.5 rounded-md
            font-body text-sm font-medium
            text-[#7B7B9A] 
            hover:text-[#F8F8FF]
            hover:bg-[rgba(255,255,255,0.04)]
            transition-all duration-200"
        >
          <ExternalLink size={18} />
          View Site
        </Link>

        {/* User email */}
        {user?.email && (
          <p className="px-3 py-1
            font-body text-[0.7rem] 
            text-[#7B7B9A] truncate italic"
            title={user.email}
          >
            {user.email}
          </p>
        )}

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-3
            px-3 py-2.5 rounded-md
            font-body text-sm font-medium
            text-red-400
            hover:bg-[rgba(239,68,68,0.08)]
            hover:text-red-300
            transition-all duration-200
            w-full text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
