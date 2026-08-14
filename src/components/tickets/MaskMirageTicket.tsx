'use client';

import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, Download } from 'lucide-react';

interface MaskMirageTicketProps {
  ticketId: string;
  name: string;
  ticketType: string;
  index?: number;
  total?: number;
}

// Ticket component (used for rendering + download)
export function TicketVisual({ ticketId, name, ticketType }: { ticketId: string; name: string; ticketType: string }) {
  const qrData = JSON.stringify({
    id: ticketId,
    event: 'Mask Mirage Party',
    date: '2026-10-10',
    type: ticketType,
    name: name,
  });

  return (
    <div style={{
      width: '1400px',
      height: '700px',
      background: 'linear-gradient(135deg, #090909 0%, #0f0f1a 50%, #090909 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      borderRadius: '20px',
      display: 'flex',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute',
        right: '-50px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(218,175,72,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        left: '-30px',
        top: '-30px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(218,175,72,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── LEFT SECTION ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        padding: '60px 50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Top: Event Info */}
        <div>
          {/* Organizer */}
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#DAAF48',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '20px',
            opacity: 0.8,
          }}>
            ASTROWAVE EVENTS
          </p>

          {/* Event Name */}
          <h1 style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            marginBottom: '8px',
          }}>
            MASK
          </h1>
          <h1 style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#DAAF48',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            marginBottom: '16px',
          }}>
            MIRAGE
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'rgba(218,175,72,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}>
            THE MASK MIRAGE PARTY 🎭
          </p>
        </div>

        {/* Middle: Event Details */}
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar size={14} color="#DAAF48" />
              <span style={{ fontSize: '10px', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Date</span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#F5F5F5' }}>10 OCTOBER 2026</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Clock size={14} color="#DAAF48" />
              <span style={{ fontSize: '10px', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Time</span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#F5F5F5' }}>9:00 PM</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <MapPin size={14} color="#DAAF48" />
              <span style={{ fontSize: '10px', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Venue</span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 600, color: '#F5F5F5' }}>COACHES LOUNGE, EAST LEGON</p>
          </div>
        </div>

        {/* Bottom: Attendee + Ticket ID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Attendee</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#F5F5F5' }}>{name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Ticket ID</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#F5F5F5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{ticketId}</p>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ───────────────────────────────────────── */}
      <div style={{
        width: '1px',
        margin: '50px 0',
        background: 'rgba(180,180,180,0.1)',
      }} />

      {/* ── RIGHT SECTION (QR) ────────────────────────────── */}
      <div style={{
        width: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Ticket Type Badge */}
        <div style={{
          padding: '6px 20px',
          borderRadius: '100px',
          background: 'rgba(218,175,72,0.1)',
          border: '1px solid rgba(218,175,72,0.2)',
          marginBottom: '24px',
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#DAAF48',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            {ticketType}
          </span>
        </div>

        {/* QR Code */}
        <div style={{
          background: '#FFFFFF',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}>
          <QRCodeSVG
            value={ticketId}
            size={240}
            level="H"
            fgColor="#090909"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Scan instruction */}
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(218,175,72,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginTop: '20px',
          textAlign: 'center',
        }}>
          SCAN TO VERIFY
        </p>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50px',
        right: '50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: '10px', color: 'rgba(180,180,180,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          VALID ONLY FOR 10 OCTOBER 2026
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(180,180,180,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          ASTROWAVEGH.COM
        </p>
      </div>
    </div>
  );
}

// Download button component
export default function MaskMirageTicket({ ticketId, name, ticketType, index = 0, total = 1 }: MaskMirageTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current) return;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#090909',
      });

      const link = document.createElement('a');
      link.download = `Mask-Mirage-${ticketId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [ticketId]);

  return (
    <div className="text-center">
      {/* Hidden ticket for rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={ticketRef}>
          <TicketVisual ticketId={ticketId} name={name} ticketType={ticketType} />
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all"
        style={{ background: '#DAAF48', color: '#090909' }}
      >
        <Download size={18} />
        Download Ticket {total > 1 ? `${index + 1}` : ''}
      </button>

      {/* Ticket ID */}
      <p className="mt-3 font-mono text-xs" style={{ color: '#B4B4B4' }}>
        {ticketId}
      </p>
    </div>
  );
}
