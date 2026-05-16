
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Share2, Upload } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';

interface CMSSEOEditorProps {
  pageId: string;
}

export default function CMSSEOEditor({ pageId }: CMSSEOEditorProps) {
  const { toast } = useToast();
  const [seo, setSeo] = useState<any>({
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    return onSnapshot(doc(db, 'cms_seo', pageId), (snap) => {
      if (snap.exists()) setSeo(snap.data());
    });
  }, [pageId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms_seo', pageId), {
        ...seo,
        pageSlug: pageId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: 'SEO Updated' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed' });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      if (!seo.keywords.includes(keywordInput.trim())) {
        setSeo({ ...seo, keywords: [...seo.keywords, keywordInput.trim()].slice(0, 10) });
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setSeo({ ...seo, keywords: seo.keywords.filter((k: string) => k !== kw) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Left: Inputs */}
      <div className="space-y-8">
        <Card className="p-8 space-y-6" glowColor="muted">
          <div className="space-y-2">
            <label className="admin-label">Page Title *</label>
            <input 
              type="text" 
              className="admin-input" 
              value={seo.title || ''} 
              onChange={e => setSeo({...seo, title: e.target.value})} 
              maxLength={70}
            />
            <div className="flex justify-between items-center px-1">
              <span className={`text-[0.6rem] font-mono ${seo.title.length > 60 ? 'text-orange-500' : 'text-muted'}`}>{seo.title.length}/60</span>
              {seo.title.length > 60 && <span className="text-[0.6rem] text-orange-500">Truncation likely</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="admin-label">Meta Description *</label>
            <textarea 
              rows={3}
              className="admin-input resize-none" 
              value={seo.description || ''} 
              onChange={e => setSeo({...seo, description: e.target.value})} 
              maxLength={170}
            />
            <div className="flex justify-between items-center px-1">
              <span className={`text-[0.6rem] font-mono ${seo.description.length > 160 ? 'text-orange-500' : 'text-muted'}`}>{seo.description.length}/160</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="admin-label">Keywords (Max 10)</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Type keyword and press Enter..."
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={addKeyword}
            />
            <div className="flex flex-wrap gap-2">
              {seo.keywords?.map((kw: string) => (
                <div key={kw} className="flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[0.65rem] text-gold font-bold uppercase">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-white transition-colors">×</button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6" glowColor="muted">
          <p className="admin-label text-purple">Social Share (Open Graph)</p>
          <div className="space-y-2">
            <label className="admin-label">OG Title</label>
            <input type="text" className="admin-input" value={seo.ogTitle || ''} onChange={e => setSeo({...seo, ogTitle: e.target.value})} placeholder="Leave blank to use page title" />
          </div>
          <div className="space-y-2">
            <label className="admin-label">OG Description</label>
            <textarea rows={2} className="admin-input resize-none" value={seo.ogDescription || ''} onChange={e => setSeo({...seo, ogDescription: e.target.value})} placeholder="Leave blank to use meta description" />
          </div>
          <div className="space-y-4">
            <label className="admin-label">OG Image (1200x630)</label>
            <div className="aspect-[1.91/1] rounded-sm bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center group overflow-hidden relative">
              {seo.ogImage ? (
                <img src={seo.ogImage} className="w-full h-full object-cover" alt="OG" />
              ) : (
                <div className="text-center p-6 text-muted space-y-2">
                  <Upload size={24} className="mx-auto" />
                  <p className="text-[0.65rem] uppercase font-bold">Upload Image</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full h-14">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          SAVE SEO SETTINGS
        </Button>
      </div>

      {/* Right: Preview */}
      <div className="space-y-8 sticky top-8 h-fit">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted">
            <Globe size={14} />
            <span className="text-[0.65rem] font-bold uppercase tracking-widest">Search Engine Preview</span>
          </div>
          <div className="bg-white p-6 rounded-md shadow-lg border border-black/5">
            <div className="text-[14px] text-[#1a0dab] font-sans hover:underline cursor-pointer truncate max-w-full">
              {seo.title || 'Page Title Placeholder'}
            </div>
            <div className="text-[12px] text-[#006621] font-sans truncate mb-1">
              https://astrowave.live › {pageId}
            </div>
            <div className="text-[12px] text-[#545454] font-sans leading-relaxed line-clamp-2">
              {seo.description || 'Meta description for the page will appear here. It should be concise and relevant.'}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted">
            <Share2 size={14} />
            <span className="text-[0.65rem] font-bold uppercase tracking-widest">Social Card Preview</span>
          </div>
          <div className="bg-[#18191a] border border-[#3e403f] rounded-lg overflow-hidden w-full max-w-[500px]">
            <div className="aspect-[1.91/1] bg-black flex items-center justify-center">
              {seo.ogImage ? <img src={seo.ogImage} className="w-full h-full object-cover" alt="" /> : <div className="text-white/10 font-display text-4xl">ASTROWAVE</div>}
            </div>
            <div className="p-4 border-t border-[#3e403f]">
              <div className="text-[11px] text-[#b0b3b8] uppercase font-bold tracking-tight mb-1">ASTROWAVE.LIVE</div>
              <div className="text-[15px] text-[#e4e6eb] font-bold truncate mb-1">{seo.ogTitle || seo.title || 'Social Title'}</div>
              <div className="text-[13px] text-[#b0b3b8] line-clamp-2">{seo.ogDescription || seo.description || 'Social description summary...'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
