'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, Loader2, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { EGOTICKETS_URL } from '@/lib/tickets';
import { trackBeginCheckout } from '@/components/GoogleAnalytics';

const MASK_MIRAGE_EVENT = {
  title: 'MASK MIRAGE PARTY',
  category: 'Nightlife',
  date: new Date('2026-10-10T21:00:00+00:00'),
  venue: 'Coaches Lounge, East Legon',
  city: 'Accra',
  description: 'A night of mystery, elegance and unforgettable energy. Standard tickets are available now on eGoTickets.',
  bannerUrl: 'https://res.cloudinary.com/dmd5bq3va/image/upload/v1786593422/gkbqxs9qvggzxd0ocy77.jpg',
  ticketLink: EGOTICKETS_URL,
  ticketTiers: [
    { tierId: 'standard', name: 'Standard', price: 50, quantity: 100, sold: 0 },
  ],
};

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
        
        if (snap.empty && slug === 'mask-mirage-party') {
          setEvent(MASK_MIRAGE_EVENT);
        } else if (snap.empty) {
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

          {/* Ticket Tiers - Standard Ticket */}
          {tiers.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#DAAF48' }}>Tickets</h2>
              <div className="space-y-3">
                {tiers.map((tier: any) => {
                  const available = tier.quantity - (tier.sold || 0);
                  const soldOut = available <= 0;
                  const ticketUrl = event.ticketLink || EGOTICKETS_URL;
                  
                  return (
                    <a
                      key={tier.tierId || tier.name}
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackBeginCheckout()}
                      className="group p-5 rounded-xl flex items-center justify-between transition-all duration-300 block hover:border-[#DAAF48]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(218,175,72,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(218,175,72,0.25)',
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg uppercase group-hover:text-[#DAAF48] transition-colors" style={{ color: '#F5F5F5' }}>
                            {tier.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest"
                            style={{
                              background: 'rgba(218,175,72,0.15)',
                              color: '#DAAF48',
                              border: '1px solid rgba(218,175,72,0.35)',
                            }}
                          >
                            Official
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#B4B4B4' }}>
                          Direct checkout via eGoTickets • Instant verification
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <p className="font-display text-2xl" style={{ color: '#DAAF48' }}>GH¢{tier.price}</p>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-1" style={{ background: '#DAAF48', color: '#090909' }}>
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </a>
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
            <a
              href={event.ticketLink || EGOTICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackBeginCheckout()}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: '#DAAF48', color: '#090909', boxShadow: '0 4px 20px rgba(218,175,72,0.25)' }}
            >
              <Ticket size={16} />
              <span>{isOnSale ? 'Get Standard Ticket on eGoTickets' : 'View on eGoTickets'}</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
