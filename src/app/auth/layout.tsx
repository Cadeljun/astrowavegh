'use client';

import React from 'react';
import Logo from '@/components/ui/Logo';

/**
 * Cinematic Shared Layout for all Auth routes (/auth/login, /auth/register, /auth/onboarding).
 * Features signature AstroWave ambient orbs and wave lines.
 */
export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020B18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <style>{`
        @keyframes float1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,-40px); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-20px,30px); }
        }
      `}</style>

      {/* Animated background orbs */}
      <div style={{
        position: 'fixed',
        top: '-150px', right: '-100px',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,135,0.06), transparent 70%)',
        animation: 'float1 9s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-100px', left: '-150px',
        width: '450px', height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.06), transparent 70%)',
        animation: 'float2 12s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Subtle wave lines */}
      <div style={{
        position: 'fixed',
        inset: 0,
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <svg
          width="100%" height="100%"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 150, 300, 450, 600, 750].map((y, i) => (
            <path
              key={i}
              d={`M0 ${y} C360 ${y - 60}, 720 ${y + 60}, 1080 ${y} S1440 ${y - 40}, 1440 ${y}`}
              stroke={i % 2 === 0 ? '#00FF87' : '#0EA5E9'}
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Grain texture overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        opacity: 0.02,
        pointerEvents: 'none',
        zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '480px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Logo height={44} linkTo="/" />
        </div>

        {children}
      </div>
    </div>
  );
}
