'use client'

import { useRole, ROLE_LABELS, 
         ROLE_COLORS } from 
  '@/context/RoleContext'
import { useAuth } from '@/context/AuthContext'
import { ShieldX, LogOut } from 'lucide-react'

export default function NoAccessPage() {
  const { role } = useRole()
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen 
      bg-[#050505] flex items-center 
      justify-center p-4">
      <div className="max-w-md w-full 
        text-center">
        <div className="w-16 h-16 
          rounded-full mx-auto mb-6
          bg-[rgba(239,68,68,0.1)]
          border border-[rgba(239,68,68,0.2)]
          flex items-center justify-center">
          <ShieldX size={28} 
            className="text-red-400" />
        </div>

        <h1 className="font-display 
          text-3xl text-[#F8F8FF] 
          uppercase mb-3">
          Access Denied
        </h1>

        <p className="font-mono text-xs 
          text-white/30 mb-2">
          {user?.email}
        </p>

        {role && (
          <div className="inline-flex 
            items-center gap-2 
            px-3 py-1.5 rounded-full
            mb-6"
            style={{
              background: `${
                (ROLE_COLORS as any)[role]
              }15`,
              border: `1px solid ${
                (ROLE_COLORS as any)[role]
              }30`
            }}
          >
            <span 
              className="w-1.5 h-1.5 
                rounded-full"
              style={{ 
                background: (ROLE_COLORS as any)[role] 
              }} 
            />
            <span 
              className="font-mono text-xs"
              style={{ color: (ROLE_COLORS as any)[role] }}
            >
              {(ROLE_LABELS as any)[role]}
            </span>
          </div>
        )}

        <p className="font-mono text-xs 
          text-white/30 mb-8 leading-relaxed">
          Your current role does not have 
          permission to access this area.
          Contact the Super Admin to 
          request access.
        </p>

        <div className="flex flex-col 
          gap-3 max-w-xs mx-auto">
          
            <a href="/"
            className="w-full py-2.5
              border border-[#1E1E2E]
              text-white/40
              font-mono text-xs uppercase
              tracking-wider rounded-md
              hover:border-white/20
              hover:text-white/70
              transition-all text-center"
          >
            Go to Main Site
          </a>
          <button
            onClick={logout}
            className="w-full py-2.5
              border border-[rgba(239,68,68,0.3)]
              text-red-400/70
              font-mono text-xs uppercase
              tracking-wider rounded-md
              hover:border-red-400/50
              hover:text-red-400
              transition-all
              flex items-center 
              justify-center gap-2"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}