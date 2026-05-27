'use client'

import { usePathname } from 'next/navigation'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Logo from '@/components/ui/Logo'

export default function AdminLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <div className="bg-dark-bg min-h-screen">{children}</div>
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-dark-bg grain">
        {/* Sidebar — desktop */}
        <div className="hidden lg:flex flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="flex lg:hidden 
            items-center justify-between
            px-6 h-16 sticky top-0 z-50
            bg-dark-bg/95 backdrop-blur-md
            border-b border-dark-border">
            <Logo height={24} linkTo="/admin/dashboard" />
            <span className="font-body font-bold
              text-[0.65rem] tracking-widest 
              uppercase text-dark-muted">
              Admin Node
            </span>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-12 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}