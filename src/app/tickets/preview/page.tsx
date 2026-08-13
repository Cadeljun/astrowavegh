'use client';

import React, { useState } from 'react';
import MaskMirageTicket from '@/components/tickets/MaskMirageTicket';
import { generateTicketId } from '@/lib/tickets';
import { RefreshCw } from 'lucide-react';

export default function TicketPreviewPage() {
  const [ticketId, setTicketId] = useState(generateTicketId());
  const [name, setName] = useState('Kofi Mensah');
  const [ticketType, setTicketType] = useState('GENERAL ADMISSION');

  const regenerate = () => {
    setTicketId(generateTicketId());
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-white uppercase tracking-wider">Ticket Preview</h1>
            <p className="text-white/40 text-sm mt-1">Preview the Mask Mirage Party ticket design</p>
          </div>
          <button
            onClick={regenerate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <RefreshCw size={14} />
            New Ticket ID
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div>
            <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#DAAF48]"
            />
          </div>
          <div>
            <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Ticket Type</label>
            <select
              value={ticketType}
              onChange={e => setTicketType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#DAAF48]"
            >
              <option value="GENERAL ADMISSION">GENERAL ADMISSION</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
              <option value="GROUP OF 4">GROUP OF 4</option>
            </select>
          </div>
          <div>
            <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest mb-2 block">Ticket ID</label>
            <input
              value={ticketId}
              readOnly
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/60 text-sm font-mono"
            />
          </div>
        </div>

        {/* Ticket */}
        <div className="flex justify-center py-8">
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
            <MaskMirageTicket
              ticketId={ticketId}
              name={name}
              ticketType={ticketType}
            />
          </div>
        </div>

        {/* Ticket ID samples */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Sample Ticket IDs</h3>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                <p className="font-mono text-sm text-[#DAAF48]">{generateTicketId()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
