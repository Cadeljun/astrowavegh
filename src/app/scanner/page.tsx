'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LegacyScannerPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/scan')
  }, [router])

  return <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}><Loader2 size={32} className="animate-spin" style={{ color: '#DAAF48' }} /></div>
}
