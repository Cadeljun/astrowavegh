'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, Ticket, User, Mail } from 'lucide-react';

interface TicketDesignProps {
  ticketId: string;
  name: string;
  email: string;
  ticketType: string;
  amount: number;
}

export default function TicketDesign({ ticketId, name, email, ticketType, amount }: TicketDesignProps) {
  const qrData = JSON.stringify({
    id: ticketId,
    event: 'Mask Mirage Party',
    date: '2026-10-10',
    type: ticketType,
    name: name,
    verify: `https://astrowavegh.com/tickets/verify?id=${ticketId}`,
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Ticket */}
      <div className="relative bg-gradient-to-br from-[#0A0A1A] to-[#151525] rounded-2xl overflow-hidden border border-purple-500/20">
        {/* Top section */}
        <div className="p-6 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Ticket size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[0.5rem] font-bold text-purple-400 uppercase tracking-widest">Mask Mirage</p>
                <p className="text-[0.4rem] text-white/30 uppercase tracking-wider">Party Ticket</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg text-white">{ticketType}</p>
              <p className="text-[0.5rem] text-white/40 uppercase">GHS {amount}</p>
            </div>
          </div>

          {/* Flyer preview */}
          <div className="rounded-xl overflow-hidden mb-4 aspect-[16/9]">
            <img
              src="https://res.cloudinary.com/dmd5bq3va/image/upload/v1786593422/gkbqxs9qvggzxd0ocy77.jpg"
              alt="Mask Mirage Party"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event details */}
          <div className="space-y-2">
            <h3 className="font-display text-xl text-white uppercase tracking-wider">Mask Mirage Party</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Calendar size={10} className="text-purple-400" />
                <span className="text-white/60 text-[0.6rem]">10 Oct 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={10} className="text-[#00C853]" />
                <span className="text-white/60 text-[0.6rem]">9:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={10} className="text-blue-400" />
                <span className="text-white/60 text-[0.6rem]">Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated line */}
        <div className="relative px-6">
          <div className="border-t border-dashed border-white/10" />
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#020B18]" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#020B18]" />
        </div>

        {/* Bottom section */}
        <div className="p-6 pt-4">
          {/* Attendee info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User size={10} className="text-white/40" />
              <span className="text-white text-[0.65rem] font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={10} className="text-white/40" />
              <span className="text-white/60 text-[0.6rem]">{email}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-center bg-white rounded-xl p-4">
            <QRCodeSVG
              value={qrData}
              size={160}
              level="H"
              fgColor="#A855F7"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Ticket ID */}
          <div className="mt-3 text-center">
            <p className="text-[0.45rem] font-mono text-white/30 uppercase tracking-widest">Ticket ID</p>
            <p className="text-[0.6rem] font-mono text-purple-400 tracking-wider">{ticketId}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-white/30 text-[0.55rem]">Show this ticket at the entrance</p>
        <p className="text-white/20 text-[0.5rem]">Screenshot or save this ticket</p>
      </div>
    </div>
  );
}
