'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const { login, error, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('junioraquils143@gmail.com')
  const [password, setPassword] = useState('Admin@Astrowave')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, loading, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await login(email, password)
      // Redirection is handled by the useEffect above once state updates
    } catch (err) {
      // Error is caught and displayed via AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(
            ellipse 60% 40% at 50% 50%,
            rgba(255,209,102,0.06),
            transparent 70%
          )`
        }}
      />
      
      {/* Grain overlay */}
      <div className="fixed inset-0 opacity-[0.035] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-20 w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.07)] border-t-[3px] border-t-[#FFD166] rounded-xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-[#FFD166] tracking-wider mb-1"
              style={{ textShadow: '0 0 20px rgba(255,209,102,0.4)' }}
            >
              ASTROWAVE
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Lock size={12} className="text-[#7B7B9A]" />
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#7B7B9A]">
                Admin Access
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-8"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,209,102,0.3), transparent)`
            }}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@astrowave.com"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[#1E1E2E] rounded-md px-4 py-3 font-body text-[0.95rem] text-[#F8F8FF] placeholder:text-[#7B7B9A] outline-none transition-all duration-200 focus:border-[#FFD166] focus:shadow-[0_0_0_3px_rgba(255,209,102,0.15)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[#1E1E2E] rounded-md px-4 py-3 pr-12 font-body text-[0.95rem] text-[#F8F8FF] placeholder:text-[#7B7B9A] outline-none transition-all duration-200 focus:border-[#FFD166] focus:shadow-[0_0_0_3px_rgba(255,209,102,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B7B9A] hover:text-[#F8F8FF] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-md px-4 py-3">
                <p className="font-body text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-transparent border border-[#FFD166] text-[#FFD166] font-body font-semibold text-sm tracking-widest uppercase py-3 px-6 rounded-md transition-all duration-200 hover:bg-[#FFD166] hover:text-black hover:shadow-[0_0_20px_rgba(255,209,102,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center mt-6 font-body text-xs text-[#7B7B9A]">
          AstroWave Admin — Restricted Access
        </p>
      </div>
    </div>
  )
}
