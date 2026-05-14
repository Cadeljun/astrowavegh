'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Cloud, Upload, Terminal, Copy, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DevCloudinaryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [testUrl, setTestUrl] = useState('');

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmd5bq3va';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(10);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'astrowave_preset');
      fd.append('folder', 'astrowave/dev-test');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: fd
      });

      setProgress(90);
      const data = await res.json();
      setResult(data);
      setTestUrl(data.secure_url);
      setProgress(100);
      toast({ title: 'Upload Success' });
    } catch (e: any) {
      setResult({ error: e.message });
      toast({ variant: 'destructive', title: 'Upload Failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const transformUrl = (transform: string) => {
    if (!testUrl) return '#';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    if (!testUrl.includes(baseUrl)) return testUrl;
    return testUrl.replace(baseUrl, `${baseUrl}${transform}/`);
  };

  return (
    <div className="space-y-12">
      {/* CLOUDINARY STATUS */}
      <Card className="p-8 bg-[#0A0A0F] border-white/5" glowColor="cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-[10px] text-muted uppercase tracking-widest">Cloud Name</p>
              <p className="text-sm text-cyan font-bold">{cloudName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted uppercase tracking-widest">Default Preset</p>
              <p className="text-sm text-white font-bold">astrowave_preset</p>
            </div>
          </div>
          <Cloud size={32} className="text-cyan/20" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* TEST UPLOAD */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em]">Direct Upload Test</h3>
          <Card className="p-12 border-dashed border-2 text-center space-y-4 relative overflow-hidden" glowColor="muted">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={loading} />
            <Upload size={32} className="mx-auto text-muted mb-4" />
            <p className="text-sm font-bold text-white uppercase">Upload any file</p>
            <p className="text-xs text-muted">Tests direct API connectivity and preset auth.</p>
          </Card>
          
          {progress > 0 && <Progress value={progress} className="h-1 bg-white/5" />}

          {result && (
            <div className="rounded-md bg-black border border-white/5 overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
                <Terminal size={12} className="text-muted" />
                <span className="text-[10px] text-muted uppercase font-bold tracking-widest">API Response</span>
              </div>
              <pre className="p-4 text-[10px] text-green-500 font-mono overflow-auto max-h-[300px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* URL TRANSFORMER */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em]">URL Transformer</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Input URL</p>
              <input 
                type="text" 
                className="admin-input h-12" 
                placeholder="Paste Cloudinary URL here..." 
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
              />
            </div>

            {testUrl && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Original', transform: '' },
                  { label: 'Auto Optimization', transform: 'f_auto,q_auto' },
                  { label: 'Thumbnail (200x200)', transform: 'c_fill,g_auto,w_200,h_200' },
                  { label: 'Grayscale', transform: 'e_grayscale' },
                ].map(t => (
                  <div key={t.label} className="flex items-center justify-between p-3 rounded-sm bg-white/5 border border-white/5 group">
                    <span className="text-[10px] text-white font-bold uppercase">{t.label}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => window.open(transformUrl(t.transform), '_blank')} className="p-1.5 hover:bg-white/10 rounded-sm text-muted hover:text-cyan"><ExternalLink size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(transformUrl(t.transform)); toast({ title: 'URL Copied' }); }} className="p-1.5 hover:bg-white/10 rounded-sm text-muted hover:text-gold"><Copy size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!testUrl && (
              <div className="h-40 flex flex-col items-center justify-center gap-3 text-muted/30 border border-white/5 rounded-sm">
                <ImageIcon size={32} />
                <p className="text-[10px] uppercase font-bold">No URL Provided</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
