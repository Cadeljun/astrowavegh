'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, Ticket, User, Mail, Music } from 'lucide-react';

interface TicketDesignProps {
  ticketId: string;
  name: string;
  email: string;
  ticketType: string;
  amount: number;
  flyerUrl?: string;
}

export default function TicketDesign({ ticketId, name, email, ticketType, amount, flyerUrl }: TicketDesignProps) {
  // QR code encodes verification URL
  const qrData = `https://astrowavegh.com/tickets/verify?id=${ticketId}`;

  return (
    <div className="w-full max-w-[340px] mx-auto">
      {/* ── TICKET CARD ──────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A1A 0%, #1A0A2E 50%, #0A1A0A 100%)' }}>
        
        {/* Top accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #A855F7, #00C853)' }} />

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.5rem] font-bold text-purple-400 uppercase tracking-[0.3em] mb-1">AstroWave Presents</p>
              <h2 className="font-display text-xl text-white uppercase tracking-wider leading-tight">Mask Mirage</h2>
              <p className="text-[0.6rem] text-white/40 mt-1">An Elegant Masquerade Experience</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Music size={16} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* ── FLYER PREVIEW ───────────────────────────────────── */}
        <div className="mx-5 rounded-xl overflow-hidden mb-4 aspect-[4/3]">
          <img
            src={flyerUrl || "https://res.cloudinary.com/dmd5bq3va/image/upload/v1786593422/gkbqxs9qvggzxd0ocy77.jpg"}
            alt="Mask Mirage Party"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── EVENT DETAILS ───────────────────────────────────── */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <Calendar size={12} className="mx-auto mb-1 text-purple-400" />
              <p className="text-[0.45rem] font-bold text-white/30 uppercase">Date</p>
              <p className="text-white text-[0.55rem] font-medium">10 Oct 2026</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <Clock size={12} className="mx-auto mb-1 text-[#00C853]" />
              <p className="text-[0.45rem] font-bold text-white/30 uppercase">Time</p>
              <p className="text-white text-[0.55rem] font-medium">9:00 PM</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5">
              <MapPin size={12} className="mx-auto mb-1 text-blue-400" />
              <p className="text-[0.45rem] font-bold text-white/30 uppercase">Venue</p>
              <p className="text-white text-[0.55rem] font-medium">Accra</p>
            </div>
          </div>
        </div>

        {/* ── PERFORATED LINE ─────────────────────────────────── */}
        <div className="relative px-5">
          <div className="border-t border-dashed border-white/10" />
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: '#0A0A1A' }} />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: '#0A0A1A' }} />
        </div>

        {/* ── TICKET INFO ─────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-5">
          {/* Attendee */}
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User size={10} className="text-white/40" />
                <span className="text-white text-[0.65rem] font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={10} className="text-white/40" />
                <span className="text-white/50 text-[0.55rem]">{email}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[0.5rem] font-bold uppercase tracking-wider">
                {ticketType}
              </span>
              <p className="font-display text-lg text-white mt-1">GHS {amount}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-3 flex items-center gap-4">
            <div className="shrink-0">
              <QRCodeSVG
                value={qrData}
                size={80}
                level="H"
                fgColor="#A855F7"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: '/favicon.svg',
                  height: 16,
                  width: 16,
                  excavate: true,
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.4rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Scan to verify</p>
              <p className="text-[0.5rem] font-mono text-gray-600 truncate">{ticketId}</p>
              <p className="text-[0.4rem] text-gray-400 mt-1">astrowavegh.com</p>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C853, #A855F7)' }} />
      </div>

      {/* ── INSTRUCTIONS ────────────────────────────────────── */}
      <div className="text-center mt-4 space-y-1">
        <p className="text-white/40 text-[0.6rem] font-medium">Show this ticket at the entrance</p>
        <p className="text-white/20 text-[0.5rem]">Screenshot or save this page</p>
      </div>
    </div>
  );
}
