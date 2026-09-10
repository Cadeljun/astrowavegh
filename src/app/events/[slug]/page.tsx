'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Loader2, XCircle, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';

export default function EventPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const q = query(
          collection(db, 'events'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1)
        );
        const snap = await getDocs(q);
        
        if (snap.empty) {
          setNotFound(true);
        } else {
          setEvent({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#DAAF48' }} />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-4" style={{ color: '#B4B4B4' }} />
          <h1 className="font-display text-2xl uppercase mb-2" style={{ color: '#F5F5F5' }}>Event Not Found</h1>
          <p className="text-sm mb-6" style={{ color: '#B4B4B4' }}>This event may have been removed or the link is incorrect.</p>
          <Link href="/events">
            <button className="px-6 py-3 rounded-lg font-bold text-sm uppercase" style={{ background: '#DAAF48', color: '#090909' }}>
              Browse Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = event.date?.toDate ? event.date.toDate() : (event.date ? new Date(event.date) : null);
  const now = new Date();
  const salesStart = event.salesStartDate?.toDate ? event.salesStartDate.toDate() : null;
  const salesEnd = event.salesEndDate?.toDate ? event.salesEndDate.toDate() : null;
  const isOnSale = (!salesStart || now >= salesStart) && (!salesEnd || now <= salesEnd);
  const tiers = event.ticketTiers || [];

  return (
    <div className="min-h-screen" style={{ background: '#090909' }}>
      {/* Banner */}
      {event.bannerUrl && (
        <div className="w-full h-[40vh] lg:h-[50vh] overflow-hidden relative">
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #090909 0%, transparent 50%)' }} />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12 -mt-20 relative z-10">
        {/* Event Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: '#DAAF48' }}>
            {event.category || 'Event'}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl uppercase leading-[0.9] mb-6" style={{ color: '#F5F5F5' }}>
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 mb-8">
            {eventDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: '#DAAF48' }} />
                <span className="text-sm" style={{ color: '#F5F5F5' }}>
                  {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {eventDate && (
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#DAAF48' }} />
                <span className="text-sm" style={{ color: '#F5F5F5' }}>
                  {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: '#DAAF48' }} />
              <span className="text-sm" style={{ color: '#F5F5F5' }}>{event.venue}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-sm leading-relaxed mb-10" style={{ color: '#B4B4B4' }}>
              {event.description}
            </p>
          )}

          {/* Ticket Tiers */}
          {tiers.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DAAF48' }}>Tickets</h2>
              <div className="space-y-3">
                {tiers.map((tier: any) => {
                  const available = tier.quantity - (tier.sold || 0);
                  const soldOut = available <= 0;
                  
                  return (
                    <div
                      key={tier.tierId || tier.name}
                      className="p-5 rounded-xl flex items-center justify-between"
                      style={{
                        background: soldOut ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${soldOut ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                        opacity: soldOut ? 0.5 : 1,
                      }}
                    >
                      <div>
                        <h3 className="font-display text-lg uppercase" style={{ color: '#F5F5F5' }}>{tier.name}</h3>
                        <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>
                          {soldOut ? 'Sold Out' : `${available} available`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl" style={{ color: '#F5F5F5' }}>GH¢{tier.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            {!isOnSale && salesStart && now < salesStart && (
              <p className="text-sm mb-4" style={{ color: '#B4B4B4' }}>
                Sales open {salesStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
              </p>
            )}
            {!isOnSale && salesEnd && now > salesEnd && (
              <p className="text-sm mb-4" style={{ color: '#B4B4B4' }}>Sales have ended</p>
            )}
            <Link href="/tickets">
              <button
                className="px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest"
                style={{ background: '#DAAF48', color: '#090909' }}
              >
                <Ticket size={16} className="inline mr-2" />
                {isOnSale ? 'Get Tickets' : 'View Tickets'}
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
