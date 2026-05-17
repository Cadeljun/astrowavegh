'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Terminal, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { ROLE_LABELS } from '@/context/RoleContext'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * DevLoginPage
 * Specialized authorization portal for internal developer tools.
 */
export default function DevLoginPage() {
  const { login, error: authError, isAdmin, loading: authLoading, clearError } = useAuth()
  const { role, roleLoading, canAccessDev } = useRole()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)

  // Automatic redirect if already authorized
  useEffect(() => {
    if (!authLoading && !roleLoading && isAdmin && canAccessDev) {
      router.replace('/dev/components')
    }
  }, [isAdmin, canAccessDev, authLoading, roleLoading, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setAccessError(null)
    
    try {
      await login(email, password)
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  // Monitor role clearance
  useEffect(() => {
    if (isAdmin && !roleLoading && role && !canAccessDev) {
      setAccessError(`CRITICAL: Identity [${(ROLE_LABELS as any)[role]}] lacks operator clearance.`)
    }
  }, [isAdmin, role, roleLoading, canAccessDev])

  if (authLoading || (isAdmin && roleLoading)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
        <p className="font-mono text-[0.6rem] text-cyan-500/60 uppercase tracking-[0.3em]">Synchronizing Security Tokens...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Terminal Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05]"
          style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #06B6D4, transparent 70%)` }}
        />
        <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-[440px]"
      >
        <div className="bg-[#08080C] border-t-[3px] border-t-cyan-500 border border-white/5 p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <Terminal size={40} className="text-cyan-400" />
            </div>
            <h1 className="font-display text-[2.2rem] text-white tracking-widest mb-1 uppercase">
              COMMAND CENTER
            </h1>
            <div className="flex items-center justify-center gap-3 text-cyan-500/40 uppercase tracking-[0.3em] text-[0.6rem] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Secure Authorization
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.2em]">OPERATOR_ID</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                onFocus={clearError}
                placeholder="identity@astrowave.dev"
                className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-sm px-5 text-sm text-cyan-50 placeholder:text-white/5 focus:border-cyan-500 focus:bg-cyan-500/[0.03] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.2em]">SECURITY_KEY</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  onFocus={clearError}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-sm px-5 text-sm text-cyan-50 placeholder:text-white/5 focus:border-cyan-500 focus:bg-cyan-500/[0.03] focus:outline-none transition-all pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(authError || accessError) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-red-500/5 border border-red-500/20 rounded-sm p-4 flex gap-4 text-red-400"
                >
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-[0.65rem] font-bold leading-relaxed uppercase tracking-[0.1em]">{authError || accessError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 bg-transparent border border-cyan-500 text-cyan-400 text-xs font-bold tracking-[0.4em] uppercase hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-20 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Initialize Link
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-white/5">
            <Link 
              href="/"
              className="flex items-center justify-center gap-3 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-white/10 hover:text-cyan-400 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Abort to Public Interface
            </Link>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[0.5rem] text-white/5 uppercase tracking-[0.5em]">
          Internal Protocol // Node: 9129689546-ca9f2
        </p>
      </motion.div>
    </div>
  )
}
