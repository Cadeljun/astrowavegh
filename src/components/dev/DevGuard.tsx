'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const DEV_ROLES = [
  'SUPER_ADMIN', 
  'EDITOR', 
  'DEVELOPER'
]

export default function DevGuard({
  children
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = 
    useState(true)
  const [allowed, setAllowed] = 
    useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/dev/login')
      setChecking(false)
      return
    }

    // Check role
    getDoc(doc(db, 'user_roles', user.uid))
      .then(snap => {
        if (
          snap.exists() &&
          snap.data().active &&
          DEV_ROLES.includes(snap.data().role)
        ) {
          setAllowed(true)
        } else {
          router.replace('/dev/login')
        }
      })
      .catch(() => {
        router.replace('/dev/login')
      })
      .finally(() => {
        setChecking(false)
      })
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050E1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          border: '2px solid #00D4FF',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: '#4A6380',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Verifying access...
        </p>
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
