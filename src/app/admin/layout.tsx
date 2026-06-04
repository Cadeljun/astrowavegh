'use client'

import { usePathname } from 'next/navigation'
import { redirect } from 'next/navigation'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  // Redirect bare /admin to dashboard
  if (pathname === '/admin') {
    // handled by middleware/page redirect
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#020B18]">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <AdminSidebar />
        </div>
        {/* Main */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="min-h-screen p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
