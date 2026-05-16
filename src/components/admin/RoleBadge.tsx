import { ROLE_LABELS, ROLE_COLORS } 
    from '@/context/RoleContext'

  export function RoleBadge({ 
    role 
  }: { 
    role: string 
  }) {
    const color = (ROLE_COLORS as any)[role] 
      || '#7B7B9A'
    const label = (ROLE_LABELS as any)[role] 
      || role

    return (
      <span
        className="inline-flex items-center 
          gap-1.5 px-2.5 py-1 rounded-full
          font-mono text-[11px] font-semibold"
        style={{
          background: `${color}15`,
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }} 
        />
        {label}
      </span>
    )
  }