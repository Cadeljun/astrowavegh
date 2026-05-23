'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Star, 
  TrendingUp, 
  Users, 
  Award, 
  Activity, 
  PieChart, 
  CheckCircle,
  Zap
} from 'lucide-react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';

export default function DevAnalyticsPage() {
  const [stats, setStats] = useState<any>({
    avgPlatformRating: 0,
    totalRatings: 0,
    topTalents: [],
    distribution: [0, 0, 0, 0, 0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch all ratings for global stats
      const rSnap = await getDocs(collection(db, 'ratings'));
      const ratings = rSnap.docs.map(d => d.data());
      
      const total = ratings.length;
      const avg = total > 0 ? ratings.reduce((acc, r) => acc + (r.averageScore || 0), 0) / total : 0;
      
      const dist = [0, 0, 0, 0, 0];
      ratings.forEach(r => {
        const score = Math.round(r.overall || 0);
        if (score >= 1 && score <= 5) dist[score - 1]++;
      });

      // Fetch Top Talents by Wave Score
      const tQuery = query(collection(db, 'talent_profiles'), orderBy('waveScore', 'desc'), limit(5));
      const tSnap = await getDocs(tQuery);
      const talents = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        avgPlatformRating: avg.toFixed(2),
        totalRatings: total,
        distribution: dist.reverse(),
        topTalents: talents
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      <SectionHeading 
        label="CORE_METRICS"
        title="PLATFORM ANALYTICS"
        subtitle="Real-time oversight of community quality and algorithmic performance."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-b-2 border-gold" glowColor="gold">
           <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-gold/10 text-gold"><Star size={24} /></div>
              <div>
                 <p className="text-4xl font-display text-white">{stats.avgPlatformRating}</p>
                 <p className="text-[0.6rem] label m-0">GLOBAL QUALITY AVG</p>
              </div>
           </div>
        </Card>
        <Card className="p-8 border-b-2 border-purple" glowColor="purple">
           <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-purple/10 text-purple"><PieChart size={24} /></div>
              <div>
                 <p className="text-4xl font-display text-white">{stats.totalRatings}</p>
                 <p className="text-[0.6rem] label m-0">TOTAL REVIEWS</p>
              </div>
           </div>
        </Card>
        <Card className="p-8 border-b-2 border-cyan" glowColor="cyan">
           <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-cyan/10 text-cyan"><Activity size={24} /></div>
              <div>
                 <p className="text-4xl font-display text-white">4.2</p>
                 <p className="text-[0.6rem] label m-0">AVG WAVE SCORE</p>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Rating Distribution */}
         <Card className="p-10 space-y-8" glowColor="muted">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
               <TrendingUp size={20} className="text-gold" />
               <h3 className="font-display text-2xl text-white uppercase tracking-wider">Rating Distribution</h3>
            </div>
            <div className="space-y-6">
               {stats.distribution.map((count: number, i: number) => {
                 const stars = 5 - i;
                 const percent = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                 return (
                   <div key={stars} className="space-y-2">
                      <div className="flex justify-between text-[0.65rem] font-bold uppercase">
                         <span className="text-muted">{stars} STARS</span>
                         <span className="text-white">{count} ({Math.round(percent)}%)</span>
                      </div>
                      <Progress value={percent} className="h-1.5 bg-white/5" />
                   </div>
                 );
               })}
            </div>
         </Card>

         {/* Top Talent Leaderboard */}
         <Card className="p-10 space-y-8" glowColor="muted">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
               <Award size={20} className="text-purple" />
               <h3 className="font-display text-2xl text-white uppercase tracking-wider">Top Wave Performers</h3>
            </div>
            <div className="overflow-hidden">
               <table className="admin-table text-[0.7rem]">
                  <thead>
                     <tr>
                        <th>RANK</th>
                        <th>TALENT</th>
                        <th>WAVE SCORE</th>
                        <th>AVG RATING</th>
                     </tr>
                  </thead>
                  <tbody>
                     {stats.topTalents.map((t: any, i: number) => (
                       <tr key={t.id} className="group">
                          <td className="font-display text-xl text-white/20">#{i + 1}</td>
                          <td>
                             <div className="flex flex-col">
                                <span className="font-bold text-white uppercase">{t.stageName}</span>
                                <span className="text-[0.6rem] text-muted">{t.category}</span>
                             </div>
                          </td>
                          <td><span className="text-gold font-bold">{t.waveScore.toFixed(1)}</span></td>
                          <td>{t.averageRating.toFixed(1)} ★</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
    </div>
  );
}
