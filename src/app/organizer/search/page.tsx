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
import Link from 'next/link';
import PlatformGuard from '@/components/platform/PlatformGuard';

const TALENT_ROLES = ['All', 'DJ', 'MC', 'Hypeman', 'Singer', 'Dancer', 'Comedian', 'Band', 'Other'];
const SORT_OPTIONS = [
  { label: 'Wave Score', value: 'waveScore' },
  { label: 'Price: Low to High', value: 'priceLow' },
  { label: 'Price: High to Low', value: 'priceHigh' }
];

export default function SearchTalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: 'All', city: 'All', minScore: 0, priceRange: [0, 20000], availableOnly: true });
  const [sortBy, setSortBy] = useState('waveScore');
  const [talent, setTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'talent_profiles'), where('active', '==', true));
    return onSnapshot(q, (snap) => {
      setTalent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const filteredTalent = useMemo(() => {
    let result = talent.filter(t => {
      const matchesSearch = t.stageName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filters.role === 'All' || t.category === filters.role;
      const matchesCity = filters.city === 'All' || t.city === filters.city;
      const matchesScore = (t.waveScore || 0) >= filters.minScore;
      const matchesAvail = !filters.availableOnly || t.available;
      return matchesSearch && matchesRole && matchesCity && matchesScore && matchesAvail;
    });
    return result.sort((a, b) => (sortBy === 'waveScore' ? b.waveScore - a.waveScore : sortBy === 'priceLow' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice));
  }, [talent, searchTerm, filters, sortBy]);

  return (
    <PlatformGuard requiredRole="organizer">
      <div className="space-y-10 pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-1">
            <h1 className="display-md text-white uppercase tracking-tight">SCOUT TALENT</h1>
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">The elite creative roster of Ghana at your fingertips</p>
          </div>
          <select className="admin-input h-12 w-48 text-[0.65rem] font-bold uppercase tracking-widest" value={sortBy} onChange={e => setSortBy(e.target.value)}>
             {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
          </select>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3 h-fit bg-[#0A0A0F] border border-white/5 rounded-xl p-8 space-y-10">
             <div className="space-y-4">
                <p className="admin-label">Talent Role</p>
                <div className="flex flex-wrap gap-2">{TALENT_ROLES.map(role => (<button key={role} onClick={() => setFilters({...filters, role})} className={cn("px-3 py-1.5 rounded-sm text-[0.65rem] font-bold uppercase tracking-widest border transition-all", filters.role === role ? "bg-gold text-black border-gold" : "bg-white/5 text-muted border-white/5")}>{role}</button>))}</div>
             </div>
             <div className="space-y-4">
                <p className="admin-label">City</p>
                <select className="admin-input h-12" value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})}><option value="All">All Cities</option>{GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
             </div>
             <div className="space-y-4">
                <p className="admin-label">Min Wave Score</p>
                <div className="flex gap-2">{[0, 3, 4, 4.5].map(score => (<button key={score} onClick={() => setFilters({...filters, minScore: score})} className={cn("flex-1 py-3 rounded-md border flex flex-col items-center gap-1 transition-all", filters.minScore === score ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-white/5 text-muted")}>{score === 0 ? 'Any' : score + '+'}</button>))}</div>
             </div>
          </aside>

          <main className="lg:col-span-9 space-y-8">
             <div className="relative">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input placeholder="Search by stage name..." className="admin-input h-16 pl-14 text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {loading ? [1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-xl border border-white/5" />) : filteredTalent.map((t) => (
                 <motion.div key={t.id} variants={scaleIn} initial="hidden" animate="show">
                   <Card className="h-full group relative overflow-hidden flex flex-col border-white/5 hover:border-gold/30 transition-all duration-500" glowColor="gold">
                      <div className="aspect-[4/5] relative overflow-hidden bg-surface">
                         <img src={t.photoURL || `https://picsum.photos/seed/${t.id}/400/500`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                         <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                            <h3 className="text-2xl font-display text-white tracking-widest uppercase">{t.stageName}</h3>
                            <div className="flex items-center gap-4 text-[0.6rem] font-bold text-white/60 uppercase">
                               <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> {t.city}</span>
                               <span className="flex items-center gap-1"><Star size={12} className="text-gold" fill="currentColor" /> {(t.waveScore || 0).toFixed(1)}</span>
                            </div>
                         </div>
                         <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-between">
                            <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4">"{t.bio || 'Professional brief coming soon.'}"</p>
                            <div className="space-y-3">
                               <Link href={`/organizer/talent/${t.id}`} className="block"><Button variant="primary" className="w-full h-11 text-[0.65rem]">VIEW FULL PROFILE</Button></Link>
                               <Button variant="secondary" className="w-full h-11 text-[0.65rem]">BOOK FOR GIG</Button>
                            </div>
                         </div>
                      </div>
                   </Card>
                 </motion.div>
               ))}
             </div>
          </main>
        </div>
      </div>
    </PlatformGuard>
  );
}