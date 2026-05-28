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

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#050E1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 32, height: 32,
        borderRadius: '50%',
        border: '2px solid #00C96B',
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  if (!isAdmin) return null

  return <>{children}</>
}
