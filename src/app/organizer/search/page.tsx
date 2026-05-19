'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, Zap, Users, Star, Award, MapPin, DollarSign, X, ChevronRight, CheckCircle, Info, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import { GHANA_CITIES } from '@/lib/constants/ghana';
import { cn } from '@/lib/utils';
import Slider from '@/components/ui/slider'; // Generic Slider mock
import Link from 'next/link';

const TALENT_ROLES = ['All', 'DJ', 'MC', 'Hypeman', 'Singer', 'Dancer', 'Comedian', 'Band', 'Other'];
const SORT_OPTIONS = [
  { label: 'Wave Score', value: 'waveScore' },
  { label: 'Price: Low to High', value: 'priceLow' },
  { label: 'Price: High to Low', value: 'priceHigh' },
  { label: 'Most Reviews', value: 'ratingCount' }
];

export default function SearchTalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'All',
    city: 'All',
    minScore: 0,
    priceRange: [0, 20000],
    availableOnly: true
  });
  const [sortBy, setSortBy] = useState('waveScore');
  const [talent, setTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'talent_profiles'),
      where('active', '==', true)
    );

    return onSnapshot(q, (snap) => {
      setTalent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const filteredTalent = useMemo(() => {
    let result = talent.filter(t => {
      const matchesSearch = 
        t.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = filters.role === 'All' || t.category === filters.role;
      const matchesCity = filters.city === 'All' || t.city === filters.city;
      const matchesScore = (t.waveScore || 0) >= filters.minScore;
      const matchesPrice = t.basePrice >= filters.priceRange[0] && t.basePrice <= filters.priceRange[1];
      const matchesAvail = !filters.availableOnly || t.available;

      return matchesSearch && matchesRole && matchesCity && matchesScore && matchesPrice && matchesAvail;
    });

    // Apply Sorting
    return result.sort((a, b) => {
      if (sortBy === 'waveScore') return b.waveScore - a.waveScore;
      if (sortBy === 'priceLow') return a.basePrice - b.basePrice;
      if (sortBy === 'priceHigh') return b.basePrice - a.basePrice;
      if (sortBy === 'ratingCount') return b.ratingCount - a.ratingCount;
      return 0;
    });
  }, [talent, searchTerm, filters, sortBy]);

  const SidebarFilters = () => (
    <div className="space-y-10">
      <div className="space-y-4">
        <p className="admin-label">Talent Role</p>
        <div className="flex flex-wrap gap-2">
          {TALENT_ROLES.map(role => (
            <button 
              key={role} 
              onClick={() => setFilters({...filters, role})}
              className={cn(
                "px-3 py-1.5 rounded-sm text-[0.65rem] font-bold uppercase tracking-widest border transition-all",
                filters.role === role ? "bg-gold text-black border-gold" : "bg-white/5 text-muted border-white/5 hover:border-white/10"
              )}
            >{role}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="admin-label">City Selection</p>
        <select 
          className="admin-input h-12 text-sm uppercase font-bold tracking-widest"
          value={filters.city}
          onChange={e => setFilters({...filters, city: e.target.value})}
        >
          <option value="All">All GHANA CITIES</option>
          {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="admin-label">Price Range (GHS)</p>
          <p className="text-[0.6rem] font-bold text-gold">{filters.priceRange[0]} - {filters.priceRange[1]}</p>
        </div>
        <div className="px-2">
           <input 
             type="range" min="0" max="20000" step="500" 
             className="w-full accent-gold bg-white/10"
             value={filters.priceRange[1]}
             onChange={e => setFilters({...filters, priceRange: [0, Number(e.target.value)]})}
           />
        </div>
      </div>

      <div className="space-y-4">
        <p className="admin-label">Minimum Wave Score</p>
        <div className="flex gap-2">
          {[0, 2, 3, 4, 4.5].map(score => (
            <button 
              key={score}
              onClick={() => setFilters({...filters, minScore: score})}
              className={cn(
                "flex-1 py-3 rounded-md border flex flex-col items-center gap-1 transition-all",
                filters.minScore === score ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/5 text-muted"
              )}
            >
              <Star size={10} fill={filters.minScore === score ? "currentColor" : "none"} />
              <span className="text-[0.6rem] font-bold">{score === 0 ? 'Any' : score + '+'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="space-y-1">
            <p className="text-[0.65rem] font-bold text-white uppercase tracking-widest">Available Only</p>
            <p className="text-[0.55rem] text-muted uppercase">Show active performing talent</p>
         </div>
         <button 
           onClick={() => setFilters({...filters, availableOnly: !filters.availableOnly})}
           className={cn("w-12 h-6 rounded-full relative p-1 transition-all", filters.availableOnly ? "bg-gold" : "bg-white/10")}
         >
           <div className={cn("w-4 h-4 rounded-full bg-black transition-all", filters.availableOnly ? "translate-x-6" : "translate-x-0")} />
         </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="display-md text-white uppercase tracking-tight text-glow-gold">SCOUT TALENT</h1>
          <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">The elite creative roster of Ghana at your fingertips</p>
        </div>
        <div className="flex items-center gap-4">
           <select className="admin-input h-12 w-48 text-[0.65rem] font-bold uppercase tracking-widest" value={sortBy} onChange={e => setSortBy(e.target.value)}>
             {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
           </select>
           <Button variant="ghost" className="lg:hidden h-12 border border-white/5" onClick={() => setShowMobileFilters(true)}>
             <Filter size={18} className="mr-2" /> Filters
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit bg-[#0A0A0F] border border-white/5 rounded-xl p-8">
           <SidebarFilters />
        </aside>

        {/* Right: Results Area */}
        <main className="lg:col-span-9 space-y-8">
           <div className="relative">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input 
                placeholder="Search by name, stage name or specific genre vibe..." 
                className="admin-input h-16 pl-14 text-lg border-white/10 bg-white/[0.02] focus:bg-white/[0.04]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                 <span className="text-[0.6rem] font-bold text-muted uppercase tracking-widest">{filteredTalent.length} RESULTS FOUND</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[600px]">
             {loading ? (
               [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-xl border border-white/5" />)
             ) : filteredTalent.length > 0 ? (
               <AnimatePresence mode="popLayout">
                 {filteredTalent.map((t) => (
                   <motion.div key={t.id} layout variants={scaleIn} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}>
                     <Card className="h-full group relative overflow-hidden flex flex-col border-white/5 hover:border-gold/30 transition-all duration-500" glowColor="gold">
                        <div className="aspect-[4/5] relative overflow-hidden bg-surface">
                           <img src={t.photoURL || `https://picsum.photos/seed/${t.id}/400/500`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                           
                           <div className="absolute top-4 left-4 z-20">
                             <Badge variant="active" className="bg-gold text-black border-none">{t.category}</Badge>
                           </div>

                           <div className="absolute bottom-6 left-6 right-6 z-20 space-y-4">
                             <div className="space-y-1">
                                <h3 className="text-3xl font-display text-white tracking-widest uppercase text-glow-gold">{t.stageName}</h3>
                                <div className="flex items-center gap-4 text-[0.65rem] font-bold text-white/60 uppercase tracking-widest">
                                   <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> {t.city}</span>
                                   <span className="flex items-center gap-1.5"><Star size={12} className="text-gold" fill="currentColor" /> {(t.waveScore || 0).toFixed(1)}</span>
                                </div>
                             </div>
                           </div>

                           {/* Quick Action Overlay */}
                           <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 p-8 flex flex-col justify-between">
                              <div className="space-y-4">
                                 <SectionLabel className="mb-0">ARTIST INTEL</SectionLabel>
                                 <p className="text-xs text-white/80 leading-relaxed line-clamp-4 italic">"{t.bio || 'Professional identity brief coming soon.'}"</p>
                                 <div className="flex flex-wrap gap-1.5">
                                    {t.skills?.slice(0, 4).map((s: string) => <span key={s} className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[0.55rem] font-bold uppercase text-muted">{s}</span>)}
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                                    <div className="space-y-1">
                                       <p className="text-[0.55rem] label m-0">BASE PERFORMANCE</p>
                                       <p className="text-xl font-display text-gold">GHS {t.basePrice?.toLocaleString()}</p>
                                    </div>
                                    <Badge variant="live" className={cn(t.available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                      {t.available ? 'OPEN' : 'BUSY'}
                                    </Badge>
                                 </div>
                                 <Link href={`/organizer/talent/${t.id}`} className="block">
                                    <Button variant="primary" className="w-full h-11 text-[0.65rem]">VIEW FULL PROFILE</Button>
                                 </Link>
                                 <Button variant="secondary" className="w-full h-11 text-[0.65rem] border-white/20">BOOK FOR EVENT</Button>
                              </div>
                           </div>
                        </div>
                     </Card>
                   </motion.div>
                 ))}
               </AnimatePresence>
             ) : (
               <div className="col-span-full py-48 text-center flex flex-col items-center justify-center opacity-30 space-y-6">
                  <Zap size={80} className="text-muted" />
                  <div className="space-y-2">
                    <p className="text-2xl font-display tracking-widest uppercase">No Sync Detected</p>
                    <p className="text-xs font-bold uppercase tracking-widest">Adjust your filters to discover different creative waves.</p>
                  </div>
               </div>
             )}
           </div>
        </main>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
         {showMobileFilters && (
           <div className="fixed inset-0 z-[6000] lg:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileFilters(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute right-0 top-0 h-full w-full max-w-[320px] bg-dark border-l border-white/10 p-10 overflow-y-auto">
                 <div className="flex justify-between items-center mb-10">
                    <SectionLabel className="mb-0">FILTERS</SectionLabel>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 text-muted hover:text-white"><X size={24} /></button>
                 </div>
                 <SidebarFilters />
                 <Button className="w-full h-14 mt-12" onClick={() => setShowMobileFilters(false)}>APPLY FILTERS</Button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
