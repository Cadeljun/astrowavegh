'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCcw } from 'lucide-react';

interface LivePreviewProps {
  route: string;
  device: 'desktop' | 'tablet' | 'mobile';
}

export default function LivePreview({ route, device }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = React.useState(true);

  // In NextJS Turbopack, the port is usually 9003 for the dev server based on scripts
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const url = `${baseUrl}${route}`;

  useEffect(() => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, [url]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = url;
    }
  };

  const frames = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[90%] rounded-md border-8 border-white/5",
    mobile: "w-[390px] h-[80%] rounded-[40px] border-[10px] border-white/5 shadow-2xl relative"
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-black/40">
      <div className={cn("transition-all duration-500 overflow-hidden bg-black", frames[device])}>
        {device === 'mobile' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20" />
        )}
        
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
            <Loader2 className="animate-spin text-gold mb-3" size={32} />
            <p className="admin-label m-0 text-[0.5rem]">Connecting to Horizon...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
        />
      </div>

      <button 
        onClick={handleRefresh}
        className="absolute bottom-6 right-6 p-2 rounded-full bg-gold text-black hover:scale-110 active:scale-95 transition-all shadow-lg z-30"
        title="Refresh Preview"
      >
        <RefreshCcw size={16} />
      </button>
    </div>
  );
}
