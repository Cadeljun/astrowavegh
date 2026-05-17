'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/context/RoleContext'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Terminal, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/context/RoleContext'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * DevLoginPage
 * Specialized authorization portal for internal developer tools.
 * Features distinct styling from the main admin portal to prevent confusion.
 */
export default function DevLoginPage() {
  const { login, error: authError, isAdmin, loading: authLoading } = useAuth()
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
      // Authorization check happens in RoleContext; redirection occurs via the useEffect above.
    } catch (err) {
      // Firebase auth errors are displayed via the authError from useAuth()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Monitor for cases where credentials are valid but roles are insufficient
  useEffect(() => {
    if (isAdmin && !roleLoading && role && !canAccessDev) {
      setAccessError(`AUTH_VALID: Role [${(ROLE_LABELS as any)[role]}] lacks clearance for Dev_Ops.`)
    }
  }, [isAdmin, role, roleLoading, canAccessDev])

  if (authLoading || (isAdmin && roleLoading)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400" size={40} />
        <p className="font-mono text-[0.6rem] text-cyan-500/60 uppercase tracking-[0.2em]">Synchronizing Credentials...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Terminal Aesthetic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, #06B6D4, transparent 70%)` }}
        />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-[420px]"
      >
        <div className="bg-[#08080C] border-t-[3px] border-t-cyan-500 border border-white/5 p-10 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Terminal size={32} className="text-cyan-400" />
            </div>
            <h1 className="font-display text-[2rem] text-white tracking-widest mb-1 uppercase">
              Command Center
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-500/60 uppercase tracking-[0.2em] text-[0.6rem] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Authorization Required
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Operator Identity</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="operator@astrowave.dev"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-sm px-4 text-sm text-cyan-50 placeholder:text-white/10 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Security Token</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-sm px-4 text-sm text-cyan-50 placeholder:text-white/10 focus:border-cyan-500 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {(authError || accessError) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 flex gap-3 text-red-400"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-[0.7rem] font-medium leading-relaxed uppercase tracking-wider">{authError || accessError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-transparent border border-cyan-500 text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Initialize Dev Session'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={12} />
              Abort to Public Site
            </Link>
          </div>
        </div>
        
        <p className="text-center mt-6 text-[0.55rem] text-white/10 uppercase tracking-[0.4em]">
          Internal System // Unauthorized access is prohibited
        </p>
      </motion.div>
    </div>
  )
}
