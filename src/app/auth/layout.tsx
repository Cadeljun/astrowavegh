'use client';

import Logo from '@/components/ui/Logo';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#020B18' }}
    >
      {/* Background glows */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0,255,135,0.06), transparent 70%)`
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(14,165,233,0.06), transparent 70%)`
        }}
      />

      {/* Animated wave lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {[0, 80, 160, 240, 320].map((y, i) => (
            <path
              key={i}
              d={`M0 ${y} C200 ${y - 40}, 400 ${y + 40}, 600 ${y} S1000 ${y - 40}, 1200 ${y}`}
              stroke={i % 2 === 0 ? '#00FF87' : '#0EA5E9'}
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Grain overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo height={44} linkTo="/" />
        </div>

        {children}
      </div>
    </div>
  );
}
