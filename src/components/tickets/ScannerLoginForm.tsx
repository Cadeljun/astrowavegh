'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Loader2, Lock, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

export default function ScannerLoginForm({ redirectTo = '/scan' }: { redirectTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const token = await credential.user.getIdToken(true)
      const accessCheck = await fetch('/api/tickets/stats', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!accessCheck.ok) {
        await auth.signOut()
        setError(accessCheck.status === 403 ? 'This account is not authorized for scanner access.' : 'Scanner authentication failed.')
        return
      }

      router.replace(redirectTo)
    } catch (loginError: any) {
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'No staff account found with this email.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/user-disabled': 'This staff account is disabled.',
      }
      setError(messages[loginError?.code] || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#090909' }}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" style={{ background: 'radial-gradient(circle, rgba(218,175,72,0.06) 0%, transparent 70%)' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(218,175,72,0.1)', border: '1px solid rgba(218,175,72,0.2)' }}><Zap size={24} style={{ color: '#DAAF48' }} /></div>
          <h1 className="font-display text-2xl uppercase tracking-wider" style={{ color: '#F5F5F5' }}>Staff Access</h1>
          <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>Mask Mirage Party — Ticket Scanner</p>
        </div>
        <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[0.55rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Staff Email</label>
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }} placeholder="staff@astrowavegh.com" />
            </div>
            <div>
              <label className="text-[0.55rem] font-bold uppercase tracking-widest block mb-2" style={{ color: '#B4B4B4' }}>Password</label>
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F5' }} placeholder="Enter password" />
            </div>
            {error && <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}><AlertCircle size={14} style={{ color: '#EF4444' }} /><p className="text-xs" style={{ color: '#EF4444' }}>{error}</p></div>}
            <button type="submit" disabled={loading} className="w-full h-12 rounded-lg font-bold text-sm uppercase tracking-widest transition-all" style={{ background: '#DAAF48', color: '#090909' }}>{loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Sign In'}</button>
          </form>
          <div className="mt-6 text-center flex items-center justify-center gap-2" style={{ color: 'rgba(180,180,180,0.4)' }}><Lock size={10} /><p className="text-[0.5rem] uppercase tracking-widest">Firebase-protected staff access</p></div>
        </div>
      </motion.div>
    </div>
  )
}
