import React from 'react';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,209,102,0.05)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[rgba(168,85,247,0.05)] blur-[100px] pointer-events-none" />
      
      {/* Grain */}
      <div 
        className="fixed inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} 
      />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block group">
            <span 
              className="font-display text-3xl text-[#FFD166] transition-all group-hover:brightness-125"
              style={{ textShadow: '0 0 20px rgba(255,209,102,0.4)' }}
            >
              ASTROWAVE
            </span>
          </a>
        </div>

        {children}
      </div>
    </div>
  );
}
