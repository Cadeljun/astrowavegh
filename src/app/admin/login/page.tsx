'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const { login, error, loading, isAdmin, clearError } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin/dashboard')
    }
  }, [loading, isAdmin, router])

  // Clear error when user types
  useEffect(() => {
    if (email || password) clearError()
  }, [email, password, clearError])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false)
    }
  }

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
    </div>
  )

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

      {/* Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(20px,-30px); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-15px,20px); }
        }
        .admin-input:focus {
          border-color: #00C96B !important;
          box-shadow: 0 0 0 3px rgba(0,201,107,0.12) !important;
          outline: none;
        }
      `}</style>

      {/* Background orbs */}
      <div style={{
        position: 'absolute',
        top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,201,107,0.08), transparent 70%)',
        animation: 'float1 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px', left: '-100px',
        width: '350px', height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,130,255,0.07), transparent 70%)',
        animation: 'float2 10s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(12,30,53,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid #142440',
        borderTop: '3px solid #00C96B',
        borderRadius: '16px',
        padding: '40px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {/* Lock icon */}
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '14px',
            background: 'rgba(0,201,107,0.1)',
            border: '1px solid rgba(0,201,107,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={24} color="#00C96B" />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display), Plus Jakarta Sans, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            Admin Access
          </h1>
          <p style={{
            fontFamily: 'var(--font-body), Inter, sans-serif',
            fontSize: '0.875rem',
            color: '#8BA4BE'
          }}>
            Sign in to the AstroWave admin panel
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #142440, transparent)',
          marginBottom: '28px'
        }} />

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8BA4BE',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@astrowave.com"
              className="admin-input"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #142440',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                color: '#FFFFFF',
                boxSizing: 'border-box',
                transition: 'all 0.18s ease'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8BA4BE',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                className="admin-input"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #142440',
                  borderRadius: '10px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  transition: 'all 0.18s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8BA4BE',
                  display: 'flex',
                  padding: '4px'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
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
              <AlertCircle
                size={15}
                color="#ef4444"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: '#ef4444',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !email || !password}
            style={{
              width: '100%',
              padding: '13px 24px',
              background: submitting ? 'rgba(0,201,107,0.6)' : '#00C96B',
              border: 'none',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              cursor: submitting || !email || !password ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.18s ease',
              opacity: !email || !password ? 0.5 : 1
            }}
          >
            {submitting ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: '#4A6380',
          marginTop: '24px'
        }}>
          AstroWave Admin · Restricted Access Only
        </p>
      </div>
    </div>
  )
}
