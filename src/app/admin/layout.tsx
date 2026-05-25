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

  // Login page has no sidebar or guard
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#050505]">
        
        {/* Sidebar — desktop */}
        <div className="hidden lg:flex flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Mobile top bar */}
          <div className="flex lg:hidden 
            items-center justify-between
            px-4 h-14 sticky top-0 z-50
            bg-[#0A0A0F] 
            border-b border-[#1E1E2E]">
            <Logo height={24} linkTo="/admin/dashboard" />
            <span className="font-body 
              text-xs tracking-widest 
              uppercase text-[#7B7B9A]">
              Admin
            </span>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
