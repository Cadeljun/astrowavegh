'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, Zap, Users, Star, Award, MapPin, DollarSign, X, ChevronRight, CheckCircle, Info, Loader2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { GHANA_CITIES } from '@/lib/constants/ghana';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import PlatformGuard from '@/components/platform/PlatformGuard';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const TALENT_ROLES = ['All', 'DJ', 'MC', 'Hypeman', 'Singer', 'Dancer', 'Comedian', 'Band', 'Other'];
const SORT_OPTIONS = [
  { label: 'Wave Score', value: 'waveScore' },
  { label: 'Price: Low to High', value: 'priceLow' },
  { label: 'Price: High to Low', value: 'priceHigh' },
  { label: 'Most Reviews', value: 'ratingCount' }
];

export default function SearchTalentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    role: 'All', 
    city: 'All', 
    minScore: 0, 
    priceRange: [0, 50000], 
    availableOnly: true,
    currency: 'GHS'
  });
  const [sortBy, setSortBy] = useState('waveScore');
  const [talent, setTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Load Talent from Firestore
  useEffect(() => {
    const q = query(collection(db, 'talent_profiles'), where('active', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      setTalent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredTalent = useMemo(() => {
    let result = talent.filter(t => {
      const matchesSearch = t.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = filters.role === 'All' || t.category === filters.role;
      const matchesCity = filters.city === 'All' || t.city === filters.city;
      const matchesScore = (t.waveScore || 0) >= filters.minScore;
      const matchesAvail = !filters.availableOnly || t.available;
      const matchesPrice = (t.basePrice || 0) >= filters.priceRange[0] && (t.basePrice || 0) <= filters.priceRange[1];
      
      return matchesSearch && matchesRole && matchesCity && matchesScore && matchesAvail && matchesPrice;
    });

    return result.sort((a, b) => {
      if (sortBy === 'waveScore') return (b.waveScore || 0) - (a.waveScore || 0);
      if (sortBy === 'priceLow') return (a.basePrice || 0) - (b.basePrice || 0);
      if (sortBy === 'priceHigh') return (b.basePrice || 0) - (a.basePrice || 0);
      if (sortBy === 'ratingCount') return (b.ratingCount || 0) - (a.ratingCount || 0);
      return 0;
    });
  }, [talent, searchTerm, filters, sortBy]);

  const handleBook = async (talentItem: any) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Deep linking to talent public profile which has the booking modal
    router.push(`/organizer/talent/${talentItem.id}?action=book`);
  };

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-10 pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">SCOUT TALENT</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">The elite creative roster of Ghana at your fingertips</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 h-12 rounded-sm bg-white/5 border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-muted hover:text-white"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select 
              className="admin-input h-12 w-48 text-[0.65rem] font-bold uppercase tracking-widest" 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
            >
               {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 h-fit bg-[#0A0A0F] border border-white/5 rounded-xl p-8 space-y-10 sticky top-32">
             <div className="space-y-4">
                <p className="admin-label flex justify-between items-center">
                   Talent Category
                   {filters.role !== 'All' && <button onClick={() => setFilters({...filters, role: 'All'})} className="text-gold lowercase font-normal hover:underline">reset</button>}
                </p>
                <div className="flex flex-wrap gap-2">
                   {TALENT_ROLES.map(role => (
                     <button 
                       key={role} 
                       onClick={() => setFilters({...filters, role})}
                       className={cn(
                         "px-3 py-1.5 rounded-sm text-[0.6rem] font-bold uppercase tracking-widest border transition-all",
                         filters.role === role ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(255,209,102,0.3)]" : "bg-white/5 text-muted border-white/5 hover:border-white/20"
                       )}
                     >
                       {role}
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <p className="admin-label">Primary Location</p>
                <select 
                  className="admin-input h-11 text-xs" 
                  value={filters.city} 
                  onChange={e => setFilters({...filters, city: e.target.value})}
                >
                  <option value="All">All Cities</option>
                  {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <p className="admin-label m-0">Min Wave Score</p>
                   <span className="text-gold font-display text-lg">{filters.minScore > 0 ? filters.minScore + '★' : 'Any'}</span>
                </div>
                <div className="flex gap-2">
                   {[0, 3, 4, 4.5].map(score => (
                     <button 
                        key={score} 
                        onClick={() => setFilters({...filters, minScore: score})}
                        className={cn(
                          "flex-1 py-3 rounded-md border flex flex-col items-center gap-1 transition-all",
                          filters.minScore === score ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-white/5 text-muted hover:bg-white/10"
                        )}
                     >
                       <span className="text-[0.65rem] font-bold uppercase">{score === 0 ? 'Any' : score + '+'}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <p className="admin-label m-0">Price Range ({filters.currency})</p>
                   <span className="text-xs text-white font-bold">{filters.priceRange[1].toLocaleString()}</span>
                </div>
                <Slider 
                   defaultValue={[0, 50000]} 
                   max={50000} 
                   step={500} 
                   className="mt-2"
                   onValueChange={(val) => setFilters({...filters, priceRange: val})}
                />
             </div>

             <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-[0.7rem] font-bold text-white uppercase tracking-tight">Available Only</p>
                   <p className="text-[0.55rem] text-muted leading-none">Hide artists currently booked</p>
                </div>
                <Switch checked={filters.availableOnly} onCheckedChange={val => setFilters({...filters, availableOnly: val})} />
             </div>
          </aside>

          {/* Main Grid */}
          <main className="lg:col-span-9 space-y-8">
             <div className="relative group">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-gold transition-colors" size={24} />
                <input 
                  placeholder="Search by stage name, skills, or vibey keywords..." 
                  className="admin-input h-20 pl-16 text-xl bg-[#111118] border-white/5 focus:border-gold shadow-2xl transition-all" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {loading ? (
                 [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl border border-white/5" />)
               ) : filteredTalent.length > 0 ? (
                 <AnimatePresence mode="popLayout">
                   {filteredTalent.map((t) => (
                     <motion.div key={t.id} variants={scaleIn} initial="hidden" animate="show" layout>
                       <Card className="h-full group relative overflow-hidden flex flex-col border-white/5 hover:border-gold/30 transition-all duration-500 shadow-xl" glowColor="gold">
                          <div className="aspect-[4/5] relative overflow-hidden bg-surface">
                             <img 
                                src={t.photoURL || `https://picsum.photos/seed/${t.id}/400/500`} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                                alt={t.stageName} 
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                             
                             <div className="absolute top-4 left-4 z-20">
                                <Badge variant="active" className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[0.6rem]">{t.category}</Badge>
                             </div>

                             <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                                <h3 className="text-3xl font-display text-white tracking-widest uppercase text-glow-gold">{t.stageName}</h3>
                                <div className="flex items-center gap-4 text-[0.6rem] font-bold text-white/60 uppercase tracking-widest">
                                   <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> {t.city}</span>
                                   <span className="flex items-center gap-1 text-gold"><Star size={12} fill="currentColor" /> {(t.waveScore || 0).toFixed(1)}</span>
                                   <span className="text-white/40">•</span>
                                   <span className="text-white font-bold">{t.currency} {t.basePrice.toLocaleString()}</span>
                                </div>
                             </div>

                             {/* Quick View Overlay */}
                             <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-between z-30">
                                <div className="space-y-4">
                                   <SectionLabel className="text-gold">ABOUT ARTIST</SectionLabel>
                                   <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4">"{t.bio || 'Professional brief coming soon.'}"</p>
                                   {t.skills && (
                                     <div className="flex flex-wrap gap-1.5 pt-2">
                                        {t.skills.slice(0, 4).map((s: string) => <span key={s} className="text-[0.5rem] font-bold text-muted uppercase bg-white/5 px-2 py-1 rounded-sm">{s}</span>)}
                                     </div>
                                   )}
                                </div>
                                <div className="space-y-3">
                                   <Link href={`/organizer/talent/${t.id}`} className="block">
                                      <Button variant="primary" className="w-full h-12 text-[0.65rem] font-bold">VIEW FULL PROFILE <ArrowRight size={14} className="ml-2" /></Button>
                                   </Link>
                                   <Button onClick={() => handleBook(t)} variant="secondary" className="w-full h-12 text-[0.65rem] border-white/10">BOOK FOR GIG</Button>
                                </div>
                             </div>
                          </div>
                          <div className={cn(
                            "h-1 w-full",
                            t.available ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500/20"
                          )} />
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               ) : (
                 <div className="col-span-full py-48 text-center space-y-8 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem]">
                   <Users size={100} className="mx-auto text-gold" />
                   <div className="space-y-2">
                     <p className="text-3xl font-display tracking-[0.4em] uppercase">No Talent Found</p>
                     <p className="text-sm font-bold uppercase tracking-widest">Adjust your filters or try a different vibe search.</p>
                   </div>
                 </div>
               )}
             </div>
          </main>
        </div>
      </div>
    </PlatformGuard>
  );
}
