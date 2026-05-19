'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Music, Users, Instagram, ExternalLink, Zap, Info } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import { db, useCollection, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { fadeUp, staggerContainer, scaleIn } from '@/lib/animations';
import TalentCard from '@/components/talent/TalentCard';

const roles = ['All', 'DJ', 'Artist', 'Producer', 'Host'];

export default function SearchTalentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const talentQuery = useMemoFirebase(() => {
    return query(collection(db, 'talent_profiles'), where('active', '==', true));
  }, []);

  const { data: talent, loading } = useCollection(talentQuery);

  const filteredTalent = useMemo(() => {
    if (!talent) return [];
    return talent.filter((t: any) => {
      const matchesSearch = 
        t.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'All' || t.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [talent, searchTerm, selectedRole]);

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="display-md text-white">SCOUT TALENT</h1>
        <p className="body-md text-muted">Manually browse the elite AstroWave creative roster.</p>
      </header>

      {/* Filter Bar */}
      <Card className="p-4 bg-white/[0.02]" glowColor="muted">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              placeholder="Search by name, genre, or vibe..." 
              className="admin-input pl-12 h-14" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`whitespace-nowrap px-6 rounded-sm text-[0.7rem] font-bold uppercase tracking-widest transition-all border ${selectedRole === role ? 'bg-gold text-black border-gold' : 'bg-white/5 text-muted border-white/5 hover:border-white/20'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-md border border-white/5" />)
        ) : filteredTalent.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="contents">
            {filteredTalent.map((item: any) => (
              <motion.div key={item.id} variants={scaleIn}>
                <TalentCard 
                  name={item.stageName || item.name} 
                  role={item.role} 
                  bio={item.bio} 
                  imageUrl={item.imageUrl} 
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-full py-32 text-center space-y-6 opacity-30">
            <Users size={64} className="mx-auto" />
            <p className="text-xl font-display tracking-widest">NO TALENT MATCHES FOUND</p>
          </div>
        )}
      </div>
    </div>
  );
}
