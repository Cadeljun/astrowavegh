'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Mic, 
  Check, ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  createOrganizerProfile,
  createTalentProfile,
  updateUserRole
} from '@/lib/firebase/platform';
import Logo from '@/components/ui/Logo';

const GHANA_CITIES = [
  'Accra', 'Kumasi', 'Tamale',
  'Takoradi', 'Cape Coast', 'Tema',
  'Sunyani', 'Koforidua', 'Ho',
  'Wa', 'Bolgatanga', 'Techiman',
  'Obuasi', 'Tarkwa', 'Winneba', 'Other'
];

const TALENT_CATEGORIES = [
  { value: 'DJ', emoji: '🎵', label: 'DJ' },
  { value: 'MC', emoji: '🎤', label: 'MC' },
  { value: 'Hypeman', emoji: '🙌', label: 'Hypeman' },
  { value: 'Singer', emoji: '🎶', label: 'Singer' },
  { value: 'Dancer', emoji: '💃', label: 'Dancer' },
  { value: 'Comedian', emoji: '😂', label: 'Comedian' },
  { value: 'Band', emoji: '🎸', label: 'Band' },
  { value: 'Other', emoji: '✨', label: 'Other' }
];

export default function OnboardingPage() {
  const { user, platformUser, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'organizer' | 'talent' | null>(null);
  const [formData, setFormData] = useState({
    city: '',
    category: '',
    stageName: '',
    company: '',
    basePrice: '',
    currency: 'GHS' as 'GHS' | 'USD',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
    if (!loading && platformUser?.onboarded) {
      if (platformUser.role === 'talent') {
        router.replace('/talent/dashboard');
      } else {
        router.replace('/organizer/dashboard');
      }
    }
  }, [user, loading, platformUser, router]);

  const update = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.city) {
      errs.city = 'Please select your city';
    }
    if (role === 'talent') {
      if (!formData.stageName.trim()) {
        errs.stageName = 'Stage name is required';
      }
      if (!formData.category) {
        errs.category = 'Please select your category';
      }
      if (!formData.basePrice || Number(formData.basePrice) < 1) {
        errs.basePrice = 'Please enter your base price';
      }
    }
    return errs;
  };

  const handleFinish = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (role === 'organizer') {
        await createOrganizerProfile(user!.uid, {
          displayName: user!.displayName || '',
          email: user!.email || '',
          photoURL: user!.photoURL || '',
          city: formData.city,
          company: formData.company,
          bio: formData.bio,
          phone: '',
          region: '',
          country: 'Ghana'
        });
        await updateUserRole(user!.uid, 'organizer');
        router.push('/organizer/dashboard');
      } else if (role === 'talent') {
        await createTalentProfile(user!.uid, {
          displayName: user!.displayName || '',
          stageName: formData.stageName,
          email: user!.email || '',
          photoURL: user!.photoURL || '',
          city: formData.city,
          category: formData.category as any,
          basePrice: Number(formData.basePrice),
          currency: formData.currency,
          bio: formData.bio,
          phone: '',
          region: '',
          country: 'Ghana',
          available: true
        });
        await updateUserRole(user!.uid, 'talent');
        router.push('/talent/dashboard');
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020B18' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#00FF87' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#020B18' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,255,135,0.06), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.06), transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[560px]">
        <div className="flex justify-center mb-8">
          <Logo height={44} linkTo="/" />
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300"
                style={{
                  background: s <= step ? '#00FF87' : 'rgba(15,32,64,1)',
                  color: s <= step ? '#020B18' : '#6B8CAE',
                  border: s <= step ? 'none' : '1px solid #0F2040'
                }}
              >
                {s < step ? <Check size={14} /> : s}
              </div>
              {s < 2 && (
                <div className="w-16 h-px" style={{ background: step > s ? '#00FF87' : '#0F2040' }} />
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(4,16,32,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(14,165,233,0.15)',
            borderTop: '3px solid #00FF87'
          }}
        >
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl uppercase mb-2" style={{ color: '#F0F8FF', letterSpacing: '0.05em' }}>
                  How Will You Use AstroWave?
                </h1>
                <p className="font-body text-sm" style={{ color: '#6B8CAE' }}>
                  Welcome, {user?.displayName?.split(' ')[0]}! Choose your role to get started.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => { setRole('organizer'); setStep(2); }}
                  className="p-6 rounded-xl text-left transition-all duration-200 group"
                  style={{ background: 'rgba(0,255,135,0.05)', border: '1px solid rgba(0,255,135,0.2)' }}
                >
                  <Calendar size={32} className="mb-4" style={{ color: '#00FF87' }} />
                  <h3 className="font-display text-xl uppercase mb-2" style={{ color: '#F0F8FF' }}>I'm an Organizer</h3>
                  <p className="font-body text-[10px] mb-4 leading-relaxed uppercase font-bold tracking-widest opacity-60" style={{ color: '#6B8CAE' }}>
                    Plan events & book talent
                  </p>
                  <ul className="space-y-1.5">
                    {['Post events', 'Find matches', 'Manage bookings'].map(f => (
                      <li key={f} className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-tighter" style={{ color: '#6B8CAE' }}>
                        <Check size={12} style={{ color: '#00FF87' }} /> {f}
                      </li>
                    ))}
                  </ul>
                </button>

                <button
                  onClick={() => { setRole('talent'); setStep(2); }}
                  className="p-6 rounded-xl text-left transition-all duration-200 group"
                  style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)' }}
                >
                  <Mic size={32} className="mb-4" style={{ color: '#0EA5E9' }} />
                  <h3 className="font-display text-xl uppercase mb-2" style={{ color: '#F0F8FF' }}>I'm a Talent</h3>
                  <p className="font-body text-[10px] mb-4 leading-relaxed uppercase font-bold tracking-widest opacity-60" style={{ color: '#6B8CAE' }}>
                    Perform & grow your wave
                  </p>
                  <ul className="space-y-1.5">
                    {['Create profile', 'Get discovered', 'Build Wave Score'].map(f => (
                      <li key={f} className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-tighter" style={{ color: '#6B8CAE' }}>
                        <Check size={12} style={{ color: '#0EA5E9' }} /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs mb-3 font-bold uppercase" style={{ background: role === 'organizer' ? 'rgba(0,255,135,0.1)' : 'rgba(14,165,233,0.1)', color: role === 'organizer' ? '#00FF87' : '#0EA5E9', border: `1px solid ${role === 'organizer' ? 'rgba(0,255,135,0.3)' : 'rgba(14,165,233,0.3)'}` }}>
                  {role === 'organizer' ? '📅 Organizer' : '🎤 Talent'}
                </div>
                <h2 className="font-display text-2xl uppercase mb-2" style={{ color: '#F0F8FF', letterSpacing: '0.05em' }}>
                  Complete Your Profile
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {role === 'talent' && (
                  <div>
                    <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>Stage Name *</label>
                    <input type="text" value={formData.stageName} onChange={e => update('stageName', e.target.value)} placeholder="e.g. DJ Wave" className="admin-input h-12" />
                    {errors.stageName && <p className="font-body text-xs mt-1" style={{ color: '#ef4444' }}>{errors.stageName}</p>}
                  </div>
                )}

                {role === 'organizer' && (
                  <div>
                    <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>Company / Organisation</label>
                    <input type="text" value={formData.company} onChange={e => update('company', e.target.value)} placeholder="Optional" className="admin-input h-12" />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>City *</label>
                  <select value={formData.city} onChange={e => update('city', e.target.value)} className="admin-input h-12">
                    <option value="">Select your city</option>
                    {GHANA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.city && <p className="font-body text-xs mt-1" style={{ color: '#ef4444' }}>{errors.city}</p>}
                </div>

                {role === 'talent' && (
                  <>
                    <div>
                      <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>Category *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TALENT_CATEGORIES.map(cat => (
                          <button key={cat.value} type="button" onClick={() => update('category', cat.value)} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 border ${formData.category === cat.value ? 'bg-green-dim border-green/40' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-xl">{cat.emoji}</span>
                            <span className="font-mono text-[9px] font-bold uppercase" style={{ color: formData.category === cat.value ? '#00FF87' : '#6B8CAE' }}>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.category && <p className="font-body text-xs mt-2" style={{ color: '#ef4444' }}>{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>Base Price *</label>
                      <div className="flex gap-2">
                        <input type="number" value={formData.basePrice} onChange={e => update('basePrice', e.target.value)} placeholder="0" className="admin-input h-12 flex-1" />
                        <select value={formData.currency} onChange={e => update('currency', e.target.value)} className="admin-input h-12 w-24">
                          <option value="GHS">GHS</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      {errors.basePrice && <p className="font-body text-xs mt-1" style={{ color: '#ef4444' }}>{errors.basePrice}</p>}
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#6B8CAE' }}>Bio</label>
                  <textarea value={formData.bio} onChange={e => update('bio', e.target.value)} placeholder="A short intro..." rows={3} className="admin-input py-3 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-body font-bold text-xs uppercase tracking-widest border border-white/10 text-muted hover:text-white transition-all">← Back</button>
                <button onClick={handleFinish} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-body font-bold text-sm uppercase tracking-widest transition-all duration-200 border border-green text-green hover:bg-green hover:text-black disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <>Complete Setup <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
