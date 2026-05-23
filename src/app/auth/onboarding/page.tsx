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

const GHANA_CITIES = ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema', 'Sunyani', 'Koforidua', 'Ho', 'Wa', 'Bolgatanga', 'Techiman', 'Obuasi', 'Tarkwa', 'Winneba', 'Other'];

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
    if (!loading && !user) router.replace('/auth/login');
    if (!loading && platformUser?.onboarded) {
      router.replace(platformUser.role === 'talent' ? '/talent/dashboard' : '/organizer/dashboard');
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

  const handleFinish = async () => {
    if (!formData.city) {
      setErrors({ city: 'Please select your city' });
      return;
    }
    setSaving(true);
    try {
      if (role === 'organizer') {
        await createOrganizerProfile(user!.uid, { displayName: user!.displayName || '', email: user!.email || '', photoURL: user!.photoURL || '', city: formData.city, company: formData.company, bio: formData.bio, country: 'Ghana' });
        await updateUserRole(user!.uid, 'organizer');
        router.push('/organizer/dashboard');
      } else {
        await createTalentProfile(user!.uid, { displayName: user!.displayName || '', stageName: formData.stageName, email: user!.email || '', photoURL: user!.photoURL || '', city: formData.city, category: formData.category as any, basePrice: Number(formData.basePrice), currency: formData.currency, bio: formData.bio, country: 'Ghana', available: true });
        await updateUserRole(user!.uid, 'talent');
        router.push('/talent/dashboard');
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 size={32} className="animate-spin text-green" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="relative z-10 w-full max-w-[560px]">
        <div className="flex justify-center mb-8"><Logo height={44} /></div>
        <div className="rounded-2xl p-8 glass border-t-2 border-green">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="display-md text-white">CHOOSE YOUR ROLE</h1>
                <p className="body-md text-muted">How will you use AstroWave?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => { setRole('organizer'); setStep(2); }} className="p-8 rounded-xl bg-green/5 border border-green/20 text-left hover:bg-green/10 transition-all">
                  <Calendar size={32} className="text-green mb-4" />
                  <h3 className="font-bold text-white uppercase">Organizer</h3>
                  <p className="text-xs text-muted mt-2">Plan events and book talent.</p>
                </button>
                <button onClick={() => { setRole('talent'); setStep(2); }} className="p-8 rounded-xl bg-blue/5 border border-blue/20 text-left hover:bg-blue/10 transition-all">
                  <Mic size={32} className="text-blue mb-4" />
                  <h3 className="font-bold text-white uppercase">Talent</h3>
                  <p className="text-xs text-muted mt-2">Perform and get discovered.</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Badge variant="active" className="mb-4">{role?.toUpperCase()}</Badge>
                <h2 className="display-sm text-white">COMPLETE PROFILE</h2>
              </div>
              <div className="space-y-4">
                {role === 'talent' && (
                  <div>
                    <label className="admin-label">Stage Name *</label>
                    <input className="admin-input" value={formData.stageName} onChange={e => update('stageName', e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="admin-label">City *</label>
                  <select className="admin-input" value={formData.city} onChange={e => update('city', e.target.value)}>
                    <option value="">Select City</option>
                    {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {role === 'talent' && (
                  <div>
                    <label className="admin-label">Base Price *</label>
                    <div className="flex gap-2">
                      <input type="number" className="admin-input flex-1" value={formData.basePrice} onChange={e => update('basePrice', e.target.value)} />
                      <select className="admin-input w-24" value={formData.currency} onChange={e => update('currency', e.target.value)}>
                        <option value="GHS">GHS</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                )}
                <Button className="w-full h-14 mt-6" onClick={handleFinish} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : 'COMPLETE SETUP'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
