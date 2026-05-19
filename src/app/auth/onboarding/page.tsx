'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, ChevronRight, Loader2, Sparkles, Phone, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, useAuth } from '@/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { GHANA_CITIES } from '@/lib/constants/ghana';
import { UserRole } from '@/types/platform';
import { cn } from '@/lib/utils';

const TALENT_CATEGORIES = ['DJ', 'MC', 'Hypeman', 'Singer', 'Dancer', 'Comedian', 'Band', 'Other'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, platformUser, loading: authLoading, refreshPlatformUser } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    phone: '',
    city: 'Accra',
    company: '',
    bio: '',
    stageName: '',
    category: 'DJ',
    basePrice: '',
    currency: 'GHS' as 'GHS' | 'USD'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    } else if (!authLoading && platformUser?.onboarded) {
      router.replace(platformUser.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard');
    }
  }, [user, platformUser, authLoading, router]);

  const handleRoleSelect = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleBasicProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinalize = async () => {
    if (!user || !role) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: role,
        onboarded: true,
        updatedAt: serverTimestamp()
      });

      if (role === 'organizer' || role === 'both') {
        await setDoc(doc(db, 'organizer_profiles', user.uid), {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          phone: profileData.phone,
          city: profileData.city,
          company: profileData.company,
          bio: profileData.bio,
          eventCount: 0,
          totalSpent: 0,
          verified: false,
          rating: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      if (role === 'talent' || role === 'both') {
        await setDoc(doc(db, 'talent_profiles', user.uid), {
          uid: user.uid,
          displayName: user.displayName || '',
          stageName: profileData.stageName || user.displayName || '',
          email: user.email || '',
          phone: profileData.phone,
          city: profileData.city,
          category: profileData.category,
          basePrice: Number(profileData.basePrice) || 0,
          currency: profileData.currency,
          bio: profileData.bio,
          waveScore: 0,
          averageRating: 0,
          ratingCount: 0,
          eventCount: 0,
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          active: true,
          available: true,
          verified: false,
          featured: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await refreshPlatformUser();
      toast({ title: "Welcome to AstroWave!", description: "Redirecting to your dashboard..." });
      router.replace(role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="space-y-10">
      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-xs mx-auto mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-500",
              step >= s ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(255,209,102,0.3)]" : "border-white/10 text-muted"
            )}>
              {s}
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", step >= s ? "text-gold" : "text-muted")}>
              {s === 1 ? 'Account' : s === 2 ? 'Role' : 'Profile'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="display-md text-white">How will you use AstroWave?</h1>
              <p className="body-md text-muted">Choose your role to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="p-8 cursor-pointer group hover:border-gold transition-all duration-500 bg-white/[0.02]"
                onClick={() => handleRoleSelect('organizer')}
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-6 rounded-2xl bg-gold/10 text-gold group-hover:scale-110 transition-transform">
                    <Users size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl text-white uppercase tracking-widest">I'm an Organizer</h3>
                    <p className="text-xs text-muted leading-relaxed">I plan events and need to find the right talent for my events.</p>
                  </div>
                  <ul className="space-y-3 text-left w-full max-w-[200px] mx-auto">
                    {['Post events', 'Find matched talent', 'Manage bookings', 'Rate performers'].map(f => (
                      <li key={f} className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-wider">
                        <CheckCircle size={14} className="text-gold" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" className="w-full h-12">SELECT ORGANIZER</Button>
                </div>
              </Card>

              <Card 
                className="p-8 cursor-pointer group hover:border-purple transition-all duration-500 bg-white/[0.02]"
                onClick={() => handleRoleSelect('talent')}
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="p-6 rounded-2xl bg-purple/10 text-purple group-hover:scale-110 transition-transform">
                    <Mic size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl text-white uppercase tracking-widest">I'm a Talent</h3>
                    <p className="text-xs text-muted leading-relaxed">I perform at events and want to get discovered by organizers.</p>
                  </div>
                  <ul className="space-y-3 text-left w-full max-w-[200px] mx-auto">
                    {['Create talent profile', 'Get matched to events', 'Manage bookings', 'Build Wave Score'].map(f => (
                      <li key={f} className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-wider">
                        <CheckCircle size={14} className="text-purple" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" className="w-full h-12 border-purple text-purple hover:bg-purple">SELECT TALENT</Button>
                </div>
              </Card>
            </div>

            <div className="text-center">
              <button 
                onClick={() => handleRoleSelect('both')}
                className="text-[10px] text-muted hover:text-gold font-bold uppercase tracking-[0.2em] underline underline-offset-4"
              >
                I'm both an organizer and talent
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h2 className="display-md text-white">SET UP YOUR PROFILE</h2>
                <p className="text-xs text-muted uppercase tracking-widest">Entering details for: <span className="text-gold">{role?.toUpperCase()}</span></p>
              </div>
            </div>

            <Card className="p-8">
              <form onSubmit={handleBasicProfileSubmit} className="space-y-6">
                {role === 'organizer' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="admin-label">PHONE NUMBER *</label>
                        <input required type="tel" className="admin-input" placeholder="+233..." value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label">CITY *</label>
                        <select className="admin-input h-11" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})}>
                          {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">COMPANY NAME (OPTIONAL)</label>
                      <input className="admin-input" placeholder="e.g. Wave Productions" value={profileData.company} onChange={e => setProfileData({...profileData, company: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">BRIEF BIO</label>
                      <textarea rows={4} className="admin-input resize-none" placeholder="Tell us about your event style..." value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="admin-label">STAGE NAME *</label>
                        <input required className="admin-input" placeholder="e.g. DJ Horizon" value={profileData.stageName} onChange={e => setProfileData({...profileData, stageName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label">CATEGORY *</label>
                        <select className="admin-input h-11" value={profileData.category} onChange={e => setProfileData({...profileData, category: e.target.value})}>
                          {TALENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="admin-label">PHONE NUMBER *</label>
                        <input required type="tel" className="admin-input" placeholder="+233..." value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="admin-label">CITY *</label>
                        <select className="admin-input h-11" value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})}>
                          {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">BASE PRICE *</label>
                      <div className="flex gap-2">
                        <input required type="number" className="admin-input flex-1" placeholder="0.00" value={profileData.basePrice} onChange={e => setProfileData({...profileData, basePrice: e.target.value})} />
                        <select className="admin-input w-32 h-11" value={profileData.currency} onChange={e => setProfileData({...profileData, currency: e.target.value as any})}>
                          <option value="GHS">GHS</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="admin-label">PROFESSIONAL BIO *</label>
                      <textarea required rows={4} className="admin-input resize-none" placeholder="Describe your sound, experience, and energy..." value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full h-14 mt-4">CONTINUE <ChevronRight size={20} className="ml-2" /></Button>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,209,102,0.2)]">
                <Sparkles size={40} className="text-gold" />
              </div>
              <h2 className="display-md text-white">PROFILE READY</h2>
              <p className="body-md text-muted">Review your information before launching.</p>
            </div>

            <Card className="p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <p className="admin-label m-0">Platform Role</p>
                <Badge variant="active" className={role === 'talent' ? 'bg-purple-dim text-purple border-purple' : 'bg-gold-dim text-gold border-gold'}>
                  {role === 'both' ? 'Hybrid Operator' : role?.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Identity</span>
                  <span className="text-white font-bold">{profileData.stageName || user?.displayName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Location</span>
                  <span className="text-white font-bold">{profileData.city}, Ghana</span>
                </div>
                {role !== 'organizer' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Specialty</span>
                    <span className="text-white font-bold">{profileData.category}</span>
                  </div>
                )}
              </div>
            </Card>

            <Button disabled={loading} onClick={handleFinalize} className="w-full h-16 text-lg font-bold tracking-widest">
              {loading ? <Loader2 className="animate-spin" /> : 'GO TO MY DASHBOARD'}
            </Button>

            <button onClick={() => setStep(2)} className="w-full text-[10px] text-muted hover:text-white uppercase font-bold tracking-widest">
              Edit information
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
