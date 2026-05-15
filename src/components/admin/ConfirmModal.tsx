'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  danger = true
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[9999]
      flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 
          bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10
        w-full max-w-md
        bg-[#16161F]
        border border-[#1E1E2E]
        rounded-xl p-6
        shadow-2xl">

        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4
            text-[#7B7B9A] 
            hover:text-[#F8F8FF]
            transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full
            bg-[rgba(239,68,68,0.1)]
            flex items-center justify-center">
            <AlertTriangle size={28} 
              className="text-red-400" 
            />
          </div>
        </div>

        {/* Content */}
        <h3 className="font-display text-2xl 
          text-[#F8F8FF] uppercase 
          text-center mb-3">
          {title}
        </h3>
        <p className="font-body text-sm 
          text-[#7B7B9A] text-center 
          leading-relaxed mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4
              border border-[#1E1E2E]
              rounded-md
              font-body text-sm 
              font-semibold uppercase
              tracking-wider
              text-[#7B7B9A]
              hover:text-[#F8F8FF]
              hover:border-[#7B7B9A]
              transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4
              bg-red-500
              hover:bg-red-600
              rounded-md
              font-body text-sm 
              font-semibold uppercase
              tracking-wider
              text-white
              transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
