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
  Edit3
} from 'lucide-react'

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
  }
]

// Isolated client-only component
// renders nothing on server
function DevMeta() {
  const [mounted, setMounted] = useState(false)
  const [buildDate, setBuildDate] = useState('')

  useEffect(() => {
    setBuildDate(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    )
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="h-8" />
  )

  return (
    <div>
      <div className="flex items-center 
        gap-2 mb-1">
        <div className="w-2 h-2 rounded-full 
          bg-green-500 animate-pulse" />
        <span className="text-[10px] 
          font-bold uppercase 
          tracking-widest 
          text-green-500/80">
          Dev Environment
        </span>
      </div>
      <p className="text-[10px] opacity-40">
        Build: {buildDate}
      </p>
    </div>
  )
}

export default function DevLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(href + '/')

  return (
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
                  font-mono text-xs
                  transition-all duration-200
                  mb-0.5
                  ${active
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
          <DevMeta />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 
        overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
