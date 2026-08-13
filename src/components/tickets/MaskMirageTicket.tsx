'use client';

import React, { useMemo } from 'react';

interface MaskMirageTicketProps {
  ticketId: string;
  name?: string;
  ticketType?: string;
}

// Generate QR code as SVG using a simple pattern
function QRCodeSVG({ data, size = 330 }: { data: string; size?: number }) {
  // Use a deterministic pattern based on data
  const modules = 33; // QR version 3 = 33x33
  const moduleSize = size / modules;
  
  // Generate a deterministic pattern from the data string
  const pattern = useMemo(() => {
    const grid: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let y = 0; y < modules; y++) {
      grid[y] = [];
      for (let x = 0; x < modules; x++) {
        // Finder patterns (top-left, top-right, bottom-left)
        const isFinderTL = x < 7 && y < 7;
        const isFinderTR = x >= modules - 7 && y < 7;
        const isFinderBL = x < 7 && y >= modules - 7;
        
        if (isFinderTL || isFinderTR || isFinderBL) {
          // Finder pattern border
          const lx = isFinderTR ? x - (modules - 7) : x;
          const ly = isFinderBL ? y - (modules - 7) : y;
          
          if (lx === 0 || lx === 6 || ly === 0 || ly === 6) {
            grid[y][x] = true;
          } else if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) {
            grid[y][x] = true;
          } else {
            grid[y][x] = false;
          }
        } else {
          // Data area - use deterministic pattern
          const seed = (hash + x * 31 + y * 37 + data.charCodeAt(x % data.length)) & 0xFFFF;
          grid[y][x] = (seed % 3) !== 0;
        }
      }
    }
    return grid;
  }, [data]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {/* White background */}
      <rect width={size} height={size} fill="#FFFFFF" rx="4" />
      
      {/* QR modules */}
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * moduleSize}
              y={y * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#090909"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function MaskMirageTicket({ ticketId, name, ticketType = 'GENERAL ADMISSION' }: MaskMirageTicketProps) {
  return (
    <div style={{
      width: '1400px',
      height: '700px',
      background: '#090909',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      borderRadius: '16px',
    }}>
      {/* ── SUBTLE GOLDEN GLOW (right side) ──────────────────── */}
      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(218,175,72,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Very faint atmospheric particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 80% 50%, rgba(218,175,72,0.03) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* ── LEFT SECTION (Event Info) ────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '80px',
        top: '60px',
        width: '780px',
        height: '580px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Top: Organizer + Title */}
        <div>
          {/* Organizer */}
          <p style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#DAAF48',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            ASTROWAVE EVENTS
          </p>

          {/* Main Title */}
          <h1 style={{
            fontSize: '110px',
            fontWeight: 800,
            color: '#F5F5F5',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
            marginBottom: '20px',
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          }}>
            MASK<br />MIRAGE
          </h1>

          {/* Event Descriptor */}
          <p style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#DAAF48',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '48px',
          }}>
            THE MASK MIRAGE PARTY 🎭
          </p>
        </div>

        {/* Middle: Event Details */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '14px',
            letterSpacing: '0.05em',
          }}>
            10 OCTOBER 2026
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '14px',
            letterSpacing: '0.05em',
          }}>
            COACHES LOUNGE, EAST LEGON
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#F5F5F5',
            letterSpacing: '0.05em',
          }}>
            ADMISSION • GH¢50
          </p>
        </div>

        {/* Bottom: Ticket ID */}
        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#B4B4B4',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '6px',
          }}>
            Ticket ID
          </p>
          <p style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#F5F5F5',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.1em',
          }}>
            {ticketId}
          </p>
        </div>
      </div>

      {/* ── VERTICAL DIVIDER ─────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '940px',
        top: '60px',
        width: '1px',
        height: '580px',
        background: 'rgba(180, 180, 180, 0.15)',
      }} />

      {/* ── RIGHT SECTION (QR Code) ──────────────────────────── */}
      <div style={{
        position: 'absolute',
        right: '80px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}>
        {/* QR Code */}
        <div style={{
          background: '#FFFFFF',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(218, 175, 72, 0.1)',
        }}>
          <QRCodeSVG data={ticketId} size={330} />
        </div>

        {/* Scan instruction */}
        <p style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#DAAF48',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          textAlign: 'center',
        }}>
          SCAN TO VERIFY TICKET
        </p>
      </div>

      {/* ── BOTTOM BAR ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'rgba(180, 180, 180, 0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}>
          VALID ONLY FOR 10 OCTOBER 2026
        </p>
        <span style={{
          fontSize: '12px',
          color: 'rgba(180, 180, 180, 0.3)',
        }}>•</span>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(218, 175, 72, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}>
          {ticketType}
        </p>
      </div>
    </div>
  );
}
