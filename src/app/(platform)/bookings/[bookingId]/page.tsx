
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Calendar, 
  User, 
  DollarSign, 
  Check, 
  X, 
  MessageSquare,
  Award,
  Zap,
  Star,
  ExternalLink,
  Info,
  CheckCircle
} from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BookingStatusBadge } from '@/components/platform/BookingStatusBadge';
import { MatchBreakdown } from '@/components/platform/MatchBreakdown';
import { BookingTimeline } from '@/components/platform/BookingTimeline';
import { useToast } from '@/hooks/use-toast';
import { 
  acceptBooking, 
  declineBooking, 
  cancelBooking, 
  completeBooking 
} from '@/lib/platform/bookingService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PlatformGuard from '@/components/platform/PlatformGuard';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;
  const db = useFirestore();

  const { data: booking, loading } = useDoc<any>(doc(db, 'bookings', bookingId));
  const [actionLoading, setActionLoading] = useState(false);
  const [talentResponse, setTalentResponse] = useState('');

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gold" size={32} />
        <p className="label animate-pulse">Syncing Engagement...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-32 text-center space-y-6">
        <X size={64} className="mx-auto text-muted opacity-20" />
        <h2 className="display-sm text-white">ENGAGEMENT NOT FOUND</h2>
        <Button variant="ghost" onClick={() => router.back()}>BACK TO DASHBOARD</Button>
      </div>
    );
  }

  const isTalent = user?.uid === booking.talentId;
  const isOrganizer = user?.uid === booking.organizerId;
  const eventDate = booking.eventDate?.toDate ? booking.eventDate.toDate() : new Date(booking.eventDate);
  const isPast = eventDate < new Date();

  const handleAction = async (actionFn: () => Promise<void>, successMsg: string) => {
    setActionLoading(true);
    try {
      await actionFn();
      toast({ title: successMsg });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Action Failed", description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PlatformGuard>
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 label text-xs text-muted hover:text-gold transition-colors">
            <ArrowLeft size={16} /> BACK
          </button>
          <div className="flex items-center gap-4">
             <span className="text-[0.65rem] text-muted font-mono uppercase font-bold tracking-widest">REF: {booking.id.slice(0, 8)}</span>
             <BookingStatusBadge status={booking.status} className="h-8 px-4" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Dossier */}
          <div className="lg:col-span-8 space-y-12">
             <section className="space-y-8">
                <div className="space-y-4">
                   <SectionLabel className="mb-0">EVENT OVERVIEW</SectionLabel>
                   <h1 className="display-lg text-white leading-tight uppercase">{booking.eventTitle}</h1>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 text-gold">
                            <Calendar size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">{format(eventDate, 'PPPP')}</span>
                         </div>
                         <div className="flex items-center gap-3 text-muted">
                            <MapPin size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">{booking.eventVenue}, {booking.eventCity}</span>
                         </div>
                      </div>
                      <div className="space-y-4 border-l border-white/5 pl-8 hidden sm:block">
                         <p className="text-[0.6rem] label m-0">ENGAGEMENT VALUE</p>
                         <p className="text-3xl font-display text-gold">{booking.currency} {booking.agreedPrice?.toLocaleString()}</p>
                         <p className="text-[0.55rem] text-muted uppercase font-bold">Secure through AstroWave Gateway</p>
                      </div>
                   </div>
                </div>
             </section>

             <section className="space-y-8">
                <MatchBreakdown 
                  matchPercentage={booking.matchPercentage}
                  locationScore={booking.locationScore || 0}
                  categoryScore={booking.categoryScore || 0}
                  waveContribution={booking.waveScoreContribution || 0}
                  locationReason={booking.locationReason}
                  categoryReason={booking.categoryReason}
                />
             </section>

             <section className="space-y-6">
                <SectionLabel>ORGANIZER MESSAGE</SectionLabel>
                <div className="p-10 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                   <MessageSquare className="text-gold/20 absolute -top-4 -left-4" size={64} />
                   <p className="body-lg text-white/90 italic leading-relaxed relative z-10">
                     "{booking.message || 'No engagement message provided.'}"
                   </p>
                </div>

                {booking.talentResponse && (
                  <div className="space-y-6 pt-6">
                    <SectionLabel className="text-purple">TALENT RESPONSE</SectionLabel>
                    <div className="p-10 rounded-2xl bg-purple/5 border border-purple/10 relative overflow-hidden">
                       <Zap className="text-purple/20 absolute -top-4 -right-4" size={64} />
                       <p className="body-md text-white/90 font-medium leading-relaxed relative z-10">
                         {booking.talentResponse}
                       </p>
                    </div>
                  </div>
                )}
             </section>
          </div>

          {/* Action Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
             <Card className="p-8 space-y-8 bg-[#16161F]/60" glowColor="muted">
                <SectionLabel>{isTalent ? 'CLIENT DOSSIER' : 'ARTIST DOSSIER'}</SectionLabel>
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-surface">
                      <img 
                        src={isTalent ? (booking.organizerPhoto || 'https://picsum.photos/seed/org/100/100') : (booking.talentPhoto || 'https://picsum.photos/seed/talent/100/100')} 
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-display text-white tracking-widest uppercase">
                        {isTalent ? booking.organizerName : booking.talentStageName}
                      </h3>
                      {!isTalent && <Badge variant="active" className="bg-purple-dim text-purple border-purple text-[0.6rem]">{booking.talentCategory}</Badge>}
                   </div>
                   <div className="flex items-center gap-4 text-gold pt-2">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm font-bold">{!isTalent ? (booking.waveScore || 0).toFixed(1) : 'Host Rated'}</span>
                   </div>
                </div>
                <Button variant="ghost" className="w-full border border-white/5 text-[0.6rem] font-bold" onClick={() => window.open(isTalent ? `/organizer/profile/${booking.organizerId}` : `/organizer/talent/${booking.talentId}`, '_blank')}>
                   VIEW PUBLIC PROFILE <ExternalLink size={12} className="ml-2" />
                </Button>
             </Card>

             <BookingTimeline booking={booking} />

             {/* Dynamic Actions */}
             <div className="space-y-4 pt-6 border-t border-white/5">
                <SectionLabel>PROTOCOL ACTIONS</SectionLabel>
                
                {/* Talent Pending Actions */}
                {isTalent && booking.status === 'pending' && (
                  <div className="space-y-4">
                    <textarea 
                      placeholder="Add an optional response message..."
                      className="admin-input py-4 text-xs resize-none"
                      rows={3}
                      value={talentResponse}
                      onChange={e => setTalentResponse(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <Button 
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white border-none h-14 font-bold"
                        onClick={() => handleAction(() => acceptBooking(booking.id, user!.uid, talentResponse), "Gig Confirmed!")}
                       >
                         {actionLoading ? <Loader2 className="animate-spin" /> : <><Check size={18} className="mr-2" /> ACCEPT</>}
                       </Button>
                       <Button 
                        variant="ghost" 
                        disabled={actionLoading}
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10 h-14 font-bold"
                        onClick={() => handleAction(() => declineBooking(booking.id, user!.uid, talentResponse), "Engagement Declined")}
                       >
                         DECLINE
                       </Button>
                    </div>
                  </div>
                )}

                {/* Organizer Accepted Actions */}
                {isOrganizer && booking.status === 'accepted' && (
                  <div className="space-y-4">
                     {isPast ? (
                       <Button 
                        className="w-full h-16 text-lg font-bold tracking-[0.2em] shadow-2xl"
                        onClick={() => handleAction(() => completeBooking(booking.id, user!.uid), "Engagement Completed!")}
                        disabled={actionLoading}
                       >
                         {actionLoading ? <Loader2 className="animate-spin" /> : 'MARK AS COMPLETED'}
                       </Button>
                     ) : (
                       <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex gap-3 text-cyan-400">
                          <Info size={16} className="shrink-0" />
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest leading-relaxed">
                            Marking as complete will be available once the event date has passed.
                          </p>
                       </div>
                     )}
                     <Button 
                      variant="ghost" 
                      className="w-full border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 h-12 text-[0.65rem] font-bold"
                      onClick={() => handleAction(() => cancelBooking(booking.id, user!.uid), "Booking Cancelled")}
                      disabled={actionLoading}
                     >
                        CANCEL ENGAGEMENT
                     </Button>
                  </div>
                )}

                {/* Completion Feedback */}
                {booking.status === 'completed' && (
                  <div className="space-y-4">
                     <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 text-center space-y-4">
                        <CheckCircle className="mx-auto text-green-500" size={32} />
                        <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Experience Archived</p>
                     </div>
                     {((isOrganizer && !booking.rated) || (isTalent && !booking.ratingSubmitted)) ? (
                       <Button 
                        className="w-full h-14 bg-purple text-white border-none shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                        onClick={() => router.push(isOrganizer ? '/organizer/bookings' : '/talent/bookings')}
                       >
                         LEAVE PERFORMANCE REVIEW
                       </Button>
                     ) : (
                       <div className="p-4 rounded bg-white/5 border border-white/5 text-center text-gold text-[0.6rem] font-bold uppercase tracking-widest">
                          ★ RATING SUBMITTED
                       </div>
                     )}
                  </div>
                )}
             </div>
          </aside>
        </div>
      </div>
    </PlatformGuard>
  );
}
