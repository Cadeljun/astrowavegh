'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 
  'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ 
  message, 
  type, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 
      z-[9999] flex items-center gap-3
      px-4 py-3 rounded-lg
      bg-[#16161F]
      border-l-4
      shadow-2xl
      min-w-[280px] max-w-[380px]"
      style={{
        borderLeftColor: type === 'success'
          ? '#22c55e'
          : '#ef4444'
      }}
    >
      {type === 'success'
        ? <CheckCircle size={18} 
            className="text-green-400 
              flex-shrink-0" 
          />
        : <XCircle size={18} 
            className="text-red-400 
              flex-shrink-0" 
          />
      }
      <p className="font-body text-sm 
        text-[#F8F8FF] flex-1">
        {message}
      </p>
      <button
        onClick={onClose}
        className="text-[#7B7B9A] 
          hover:text-[#F8F8FF]
          transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
