'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import { Terminal, Loader2 } from 'lucide-react'

interface DevGuardProps {
  children: React.ReactNode
  requireCMS?: boolean
}

export default function DevGuard({
  children,
  requireCMS = false
}: DevGuardProps) {
  const { isAdmin, loading: authLoading } = 
    useAuth()
  const { 
    canAccessDev, 
    canEditCMS,
    roleLoading,
    role
  } = useRole()
  const router = useRouter()

  const isLoading = authLoading || roleLoading

  useEffect(() => {
    if (isLoading) return

    // Not signed in → dev login
    if (!isAdmin) {
      router.replace('/dev/login')
      return
    }

    // Signed in but no dev access
    if (!canAccessDev) {
      router.replace('/dev/no-access')
      return
    }

    // Needs CMS access but doesn't have it
    if (requireCMS && !canEditCMS) {
      router.replace('/dev/no-access')
      return
    }
  }, [
    isLoading, isAdmin, 
    canAccessDev, canEditCMS,
    requireCMS, router
  ])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen 
        bg-[#050505] flex items-center 
        justify-center">
        <div className="flex flex-col 
          items-center gap-4">
          <Loader2 size={28} 
            className="text-[#06B6D4] 
              animate-spin" 
          />
          <p className="font-mono text-xs 
            text-white/30 tracking-widest 
            uppercase">
            Verifying access...
          </p>
        </div>
      </div>
    )
  }

  // No access states
  if (!isAdmin || !canAccessDev) return null
  if (requireCMS && !canEditCMS) return null

  return <>{children}</>
}