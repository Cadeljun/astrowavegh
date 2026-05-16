'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Terminal, 
         AlertCircle } from 'lucide-react'
import { 
  ROLE_LABELS, 
  ROLE_COLORS 
} from '@/context/RoleContext'

export default function DevLoginPage() {
  const { login, error: authError } = 
    useAuth()
  const { role, roleLoading, canAccessDev } = 
    useRole()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = 
    useState('')
  const [showPassword, setShowPassword] = 
    useState(false)
  const [isSubmitting, setIsSubmitting] = 
    useState(false)
  const [accessError, setAccessError] = 
    useState<string | null>(null)

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAccessError(null)
    try {
      await login(email, password)
      // Role check happens after login
      // via RoleContext onSnapshot
    } catch {
      // Auth errors handled in AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  // After login check role access
  useEffect(() => {
    if (!roleLoading && role) {
      if (canAccessDev) {
        router.replace('/dev/components')
      } else {
        setAccessError(
          `Your role (${(ROLE_LABELS as any)[role]}) does not have dev panel access.`
        )
      }
    }
  }, [role, roleLoading, canAccessDev, router])

  return (
    <div className="min-h-screen 
      bg-[#050505] flex items-center 
      justify-center p-4"
      style={{
        backgroundImage: `radial-gradient(
          ellipse 50% 40% at 50% 50%,
          rgba(6,182,212,0.05),
          transparent 70%
        )`
      }}
    >
      <div className="w-full max-w-[400px]">

        {/* Card */}
        <div className="
          bg-[rgba(255,255,255,0.02)]
          backdrop-blur-xl
          border border-[rgba(255,255,255,0.06)]
          border-t-[3px] border-t-[#06B6D4]
          rounded-xl p-8">

          {/* Header */}
          <div className="flex flex-col 
            items-center mb-8">
            <div className="w-12 h-12 
              rounded-xl
              bg-[rgba(6,182,212,0.1)]
              border border-[rgba(6,182,212,0.2)]
              flex items-center justify-center
              mb-4">
              <Terminal size={22} 
                className="text-[#06B6D4]" />
            </div>
            <h1 className="font-display 
              text-2xl text-[#F8F8FF] 
              uppercase tracking-wider">
              Dev Panel
            </h1>
            <p className="font-mono text-xs 
              text-white/30 mt-1 
              tracking-widest uppercase">
              AstroWave Internal Tool
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-6"
            style={{
              background: `linear-gradient(
                90deg, transparent,
                rgba(6,182,212,0.3),
                transparent
              )`
            }}
          />

          {/* Role access info */}
          <div className="mb-6 p-3 rounded-lg
            bg-[rgba(6,182,212,0.05)]
            border border-[rgba(6,182,212,0.1)]">
            <p className="font-mono text-[10px]
              text-white/30 leading-relaxed">
              Access requires one of these roles:
              <span className="block mt-1">
                {['SUPER_ADMIN', 'EDITOR', 
                  'DEVELOPER'].map(r => (
                  <span key={r}
                    className="inline-flex 
                      items-center gap-1 
                      mr-2">
                    <span 
                      className="w-1.5 h-1.5 
                        rounded-full"
                      style={{ 
                        background: 
                          (ROLE_COLORS as any)[r] 
                      }} 
                    />
                    <span style={{ 
                      color: (ROLE_COLORS as any)[r] 
                    }}>
                      {(ROLE_LABELS as any)[r]}
                    </span>
                  </span>
                ))}
              </span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}
            className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="font-mono 
                text-[10px] font-semibold 
                tracking-[0.1em] uppercase 
                text-white/30 block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => 
                  setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2.5
                  bg-[rgba(255,255,255,0.03)]
                  border border-[#1E1E2E]
                  rounded-md
                  font-mono text-xs
                  text-white/80
                  placeholder:text-white/15
                  outline-none
                  focus:border-[#06B6D4]
                  focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]
                  transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-mono 
                text-[10px] font-semibold 
                tracking-[0.1em] uppercase 
                text-white/30 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword 
                    ? 'text' 
                    : 'password'}
                  value={password}
                  onChange={e => 
                    setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 
                    py-2.5 pr-10
                    bg-[rgba(255,255,255,0.03)]
                    border border-[#1E1E2E]
                    rounded-md
                    font-mono text-xs
                    text-white/80
                    placeholder:text-white/15
                    outline-none
                    focus:border-[#06B6D4]
                    focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]
                    transition-all"
                />
                <button
                  type="button"
                  onClick={() => 
                    setShowPassword(
                      !showPassword
                    )}
                  className="absolute right-3 
                    top-1/2 -translate-y-1/2
                    text-white/20 
                    hover:text-white/50
                    transition-colors"
                >
                  {showPassword 
                    ? <EyeOff size={14} /> 
                    : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Auth Error */}
            {authError && (
              <div className="flex items-start 
                gap-2 p-3 rounded-lg
                bg-[rgba(239,68,68,0.08)]
                border border-[rgba(239,68,68,0.2)]">
                <AlertCircle size={13} 
                  className="text-red-400 
                    flex-shrink-0 mt-0.5" 
                />
                <p className="font-mono 
                  text-[11px] text-red-400">
                  {authError}
                </p>
              </div>
            )}

            {/* Access Error */}
            {accessError && (
              <div className="flex items-start 
                gap-2 p-3 rounded-lg
                bg-[rgba(239,68,68,0.08)]
                border border-[rgba(239,68,68,0.2)]">
                <AlertCircle size={13} 
                  className="text-red-400 
                    flex-shrink-0 mt-0.5" 
                />
                <p className="font-mono 
                  text-[11px] text-red-400">
                  {accessError}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2
                bg-transparent
                border border-[#06B6D4]
                text-[#06B6D4]
                font-mono text-xs 
                font-semibold uppercase
                tracking-widest rounded-md
                hover:bg-[#06B6D4]
                hover:text-black
                hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition-all
                flex items-center 
                justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 
                    rounded-full border-2 
                    border-current 
                    border-t-transparent 
                    animate-spin" 
                  />
                  Signing in...
                </>
              ) : (
                'Access Dev Panel'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-4 
          font-mono text-[10px] 
          text-white/15">
          AstroWave Internal · 
          Authorised Personnel Only
        </p>
      </div>
    </div>
  )
}