'use client'

import { usePathname } from 'next/navigation'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#020B18]">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="min-h-screen p-4 lg:p-10 pt-16 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
