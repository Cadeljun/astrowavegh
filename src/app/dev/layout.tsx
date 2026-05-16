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
  LogOut
} from 'lucide-react'
import DevGuard from '@/components/dev/DevGuard'
import { useRole, ROLE_LABELS, ROLE_COLORS } from '@/context/RoleContext'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  {
    label: 'Components',
    href: '/dev/components',
    icon: Blocks
  },
  {
    label: 'Colors',
    href: '/dev/colors',
    icon: Palette
  },
  {
    label: 'Typography',
    href: '/dev/typography',
    icon: Type
  },
  {
    label: 'Animations',
    href: '/dev/animations',
    icon: Zap
  },
  {
    label: 'Firebase',
    href: '/dev/firebase',
    icon: Flame
  },
  {
    label: 'Cloudinary',
    href: '/dev/cloudinary',
    icon: Cloud
  },
  {
    label: 'Seed Database',
    href: '/dev/seed',
    icon: Database
  },
  {
    label: 'Page Previews',
    href: '/dev/previews',
    icon: Layout
  },
  {
    label: 'CMS Editor',
    href: '/dev/cms',
    icon: Edit3
  },
  {
    label: 'Permissions',
    href: '/dev/permissions',
    icon: ShieldCheck
  }
]

function SidebarUser() {
  const [mounted, setMounted] = 
    useState(false)
  const { user, logout } = useAuth()
  const { role } = useRole()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="h-16" />
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Role badge */}
      {role && (
        <div 
          className="flex items-center 
            gap-2 px-2 py-1.5 rounded-lg"
          style={{
            background: `${
              (ROLE_COLORS as any)[role]
            }10`,
            border: `1px solid ${
              (ROLE_COLORS as any)[role]
            }25`
          }}
        >
          <div 
            className="w-2 h-2 rounded-full 
              flex-shrink-0"
            style={{ 
              background: (ROLE_COLORS as any)[role] 
            }} 
          />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px]
              font-semibold"
              style={{ color: (ROLE_COLORS as any)[role] }}
            >
              {(ROLE_LABELS as any)[role]}
            </p>
            <p className="font-mono text-[9px]
              text-white/25 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={logout}
        className="flex items-center gap-2
          px-2 py-1.5 rounded-md
          font-mono text-[10px]
          text-white/25
          hover:text-red-400
          hover:bg-[rgba(239,68,68,0.08)]
          transition-colors w-full text-left"
      >
        <LogOut size={11} />
        Sign Out
      </button>
    </div>
  )
}

export default function DevLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { canEditCMS, isSuperAdmin } = useRole()

  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(href + '/')

  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'CMS Editor') {
        return canEditCMS;
    }
    if (item.label === 'Seed Database' || item.label === 'Firebase') {
        return isSuperAdmin;
    }
    return true;
  });

  return (
    <DevGuard>
      <div className="flex min-h-screen 
        bg-[#050505]">

        {/* Sidebar */}
        <aside className="w-64 
          border-r border-white/5
          flex flex-col
          sticky top-0 h-screen
          bg-[#0A0A0F]">

          {/* Header */}
          <div className="p-6 
            border-b border-white/5">
            <div className="flex items-center 
              gap-2 mb-1">
              <span className="font-display 
                text-lg text-[#FFD166]">
                ASTROWAVE
              </span>
            </div>
            <p className="text-[10px] 
              font-mono opacity-40 
              tracking-widest uppercase">
              Dev Panel
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 
            overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    px-3 py-2.5 rounded-md
                    font-mono text-xs
                    transition-all duration-200
                    mb-0.5
                    ${
                      active
                        ? 'bg-[rgba(255,209,102,0.1)] text-[#FFD166] border-l-2 border-[#FFD166] pl-[10px]'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent'
                    }
                  `}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom meta — client only */}
          <div className="p-6 
            border-t border-white/5 
            bg-black/20">
            <SidebarUser />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 
          overflow-auto p-8">
          {children}
        </main>
      </div>
    </DevGuard>
  )
}
