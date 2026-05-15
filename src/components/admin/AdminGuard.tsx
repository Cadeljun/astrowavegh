'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AdminGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/admin/login')
    }
  }, [isAdmin, loading, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen 
        bg-[#050505] flex items-center 
        justify-center">
        <div className="flex flex-col 
          items-center gap-4">
          <div className="w-10 h-10 
            rounded-full border-2 
            border-[#FFD166] 
            border-t-transparent 
            animate-spin" 
          />
          <p className="font-body text-sm 
            tracking-widest uppercase 
            text-[#7B7B9A]">
            Verifying access...
          </p>
        </div>
      </div>
    )
  }

  // Redirect happening, show nothing
  if (!isAdmin) return null

  // Authenticated — render children
  return <>{children}</>
}
