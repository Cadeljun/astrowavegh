'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Terminal, AlertCircle, 
  ShieldX, Loader2 
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

// Google SVG icon
function GoogleIcon({ size = 20 }: 
  { size?: number }) {
  return (
    <svg width={size} height={size}
      viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const DEV_ALLOWED_ROLES = [
  'SUPER_ADMIN', 
  'EDITOR', 
  'DEVELOPER'
]

const ROLE_INFO: Record<string, { color: string, label: string, access: string }> = {
  SUPER_ADMIN: { 
    color: '#00C96B', 
    label: 'Super Admin',
    access: 'Full dev panel access'
  },
  EDITOR: { 
    color: '#0582FF', 
    label: 'Editor',
    access: 'CMS editor access'
  },
  DEVELOPER: { 
    color: '#00D4FF', 
    label: 'Developer',
    access: 'Technical tools access'
  },
  VIEWER: { 
    color: '#4A6380', 
    label: 'Viewer',
    access: 'No dev panel access'
  }
}

export default function DevLoginPage() {
  const { 
    user, loading, 
    signInWithGoogle, error,
    clearError
  } = useAuth()
  const router = useRouter()
  const [signing, setSigning] = 
    useState(false)
  const [checkingRole, setCheckingRole] = 
    useState(false)
  const [accessError, setAccessError] = 
    useState<string | null>(null)

  // If already logged in check role
  useEffect(() => {
    if (loading || !user) return
    checkUserRole(user.uid)
  }, [user, loading])

  const checkUserRole = async (uid: string) => {
    setCheckingRole(true)
    try {
      const snap = await getDoc(
        doc(db, 'user_roles', uid)
      )
      if (snap.exists()) {
        const data = snap.data()
        const role = data.role
        const active = data.active
        
        if (!active) {
          setAccessError(
            'Your account has been deactivated.'
          )
          return
        }
        
        if (DEV_ALLOWED_ROLES.includes(role)) {
          router.replace('/dev')
        } else {
          setAccessError(
            `Your role (${
              ROLE_INFO[role]?.label || role
            }) does not have access to the dev panel.`
          )
        }
      } else {
        setAccessError(
          'No role assigned to your account. Contact Super Admin.'
        )
      }
    } catch (e) {
      setAccessError(
        'Failed to verify access. Try again.'
      )
    } finally {
      setCheckingRole(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setSigning(true)
    setAccessError(null)
    clearError()
    try {
      await signInWithGoogle()
      // Role check happens in useEffect
    } catch {
      // error handled in context
    } finally {
      setSigning(false)
    }
  }

  const isLoading = loading || 
    checkingRole || signing

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050E1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(25px,-35px); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-20px,25px); }
        }
        .dev-google-btn:hover {
          background: rgba(240,248,255,0.92) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px 
            rgba(0,212,255,0.2) !important;
        }
        .dev-google-btn:active {
          transform: translateY(0) !important;
        }
      `}</style>

      {/* Cyan orb top right */}
      <div style={{
        position: 'absolute',
        top: '-120px', right: '-80px',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.07), transparent 70%)',
        animation: 'float1 9s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      {/* Blue orb bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '-80px', left: '-120px',
        width: '380px', height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,130,255,0.07), transparent 70%)',
        animation: 'float2 11s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(12,30,53,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid #142440',
        borderTop: '3px solid #00D4FF',
        borderRadius: '16px',
        padding: '40px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '14px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Terminal 
              size={24} 
              color="#00D4FF" 
            />
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            Dev Panel
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            color: '#8BA4BE'
          }}>
            AstroWave Internal Tools
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
          marginBottom: '24px'
        }} />

        {/* Role access info */}
        <div style={{
          padding: '14px 16px',
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: '#8BA4BE',
            marginBottom: '10px'
          }}>
            Access requires one of these roles:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {Object.entries(ROLE_INFO)
              .filter(([r]) => 
                DEV_ALLOWED_ROLES.includes(r)
              )
              .map(([role, info]) => (
              <span key={role} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '100px',
                background: `${info.color}15`,
                border: `1px solid ${info.color}30`,
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: info.color
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: info.color,
                  display: 'inline-block'
                }} />
                {info.label}
              </span>
            ))}
          </div>
        </div>

        {/* Auth errors */}
        {(error || accessError) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            {accessError
              ? <ShieldX size={15} 
                  color="#ef4444"
                  style={{ 
                    flexShrink: 0, 
                    marginTop: 1 
                  }} />
              : <AlertCircle size={15}
                  color="#ef4444"
                  style={{ 
                    flexShrink: 0, 
                    marginTop: 1 
                  }} />
            }
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: '#ef4444',
              margin: 0
            }}>
              {accessError || error}
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          className="dev-google-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '13px 24px',
            background: isLoading
              ? 'rgba(240,248,255,0.7)'
              : '#F0F8FF',
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#050E1A',
            cursor: isLoading
              ? 'not-allowed'
              : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.18s ease',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid #050E1A',
                borderTopColor: 'transparent',
                animation: 
                  'spin 0.8s linear infinite',
                display: 'inline-block'
              }} />
              {checkingRole
                ? 'Checking access...'
                : 'Signing in...'
              }
            </>
          ) : (
            <>
              <GoogleIcon size={20} />
              Continue with Google
            </>
          )}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.72rem',
          color: '#4A6380',
          marginTop: '24px'
        }}>
          AstroWave Internal · 
          Authorised Personnel Only
        </p>
      </div>
    </div>
  )
}
