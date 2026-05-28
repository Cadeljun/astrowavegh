'use client'

import { usePathname } from 'next/navigation'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#050E1A'
      }}>
        <div className="hidden lg:flex flex-shrink-0">
          <AdminSidebar />
        </div>
        <main style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto',
          minWidth: 0
        }}>
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
