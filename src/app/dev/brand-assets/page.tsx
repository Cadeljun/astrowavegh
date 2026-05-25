'use client'

import { useState, useEffect } from 'react'
import { 
  Image, Globe, Monitor,
  Smartphone, Share2, Play,
  Palette, RefreshCw, Check,
  AlertCircle, Loader2, ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react'
import AssetUploadZone from '@/components/dev/AssetUploadZone'
import { 
  saveBrandAsset,
  getBrandAssets,
  saveFaviconSVG
} from '@/lib/brandAssets'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { MEDIA_SCHEMA } from '@/lib/cloudinary'

export default function BrandAssetsPage() {
  const [assets, setAssets] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('logo')
  const [svgCode, setSvgCode] = useState('')

  const loadAssets = async () => {
    setLoading(true)
    const data = await getBrandAssets()
    setAssets(data)
    setSvgCode(data.faviconSvgCode || '')
    setLoading(false)
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const updateFaviconInDOM = (url: string) => {
    const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]']
    selectors.forEach(selector => {
      const links = document.querySelectorAll(selector)
      links.forEach(link => { (link as HTMLLinkElement).href = url })
      if (links.length === 0) {
        const link = document.createElement('link')
        link.rel = selector.includes('apple') ? 'apple-touch-icon' : 'icon'
        link.href = url
        document.head.appendChild(link)
      }
    })
  }

  const handleSaveSvgCode = async () => {
    await saveFaviconSVG(svgCode)
    loadAssets()
  }

  if (loading && !assets) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green" size={32} />
        <p className="label">Syncing Brand Repository...</p>
      </div>
    )
  }

  const configuredCount = Object.keys(assets || {}).filter(k => assets[k] && k.toLowerCase().includes('url')).length
  const totalAssets = 14

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="display-md text-white">BRAND ASSETS</h1>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mt-1">Unified Identity Manager · Live Sync Active</p>
        </div>
        <div className="flex items-center gap-4">
           {assets?.updatedAt && (
             <span className="text-[0.6rem] text-muted font-mono uppercase tracking-widest">
               Last Sync: {assets.updatedAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}
             </span>
           )}
           <Button variant="ghost" size="sm" className="border border-white/5" onClick={loadAssets}>
             <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} /> REFRESH
           </Button>
        </div>
      </header>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6" glowColor="green">
          <div className="flex justify-between items-end mb-4">
            <p className="font-mono text-xs text-white uppercase font-bold tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-green" /> Deployment Progress: {configuredCount} of {totalAssets} assets
            </p>
            <span className="text-green font-mono text-xs font-bold">{Math.round((configuredCount / totalAssets) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green shadow-[0_0_15px_var(--color-green)] transition-all duration-1000" style={{ width: `${(configuredCount / totalAssets) * 100}%` }} />
          </div>
        </Card>
        <Card className="p-6 flex flex-col justify-center items-center gap-2" glowColor="muted">
           <Globe size={24} className="text-muted/40" />
           <p className="text-[0.6rem] label m-0 font-bold uppercase tracking-widest">Global CDN</p>
           <p className="text-xs text-white font-mono uppercase">Cloudinary Active</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-white/5">
        {[
          { id: 'logo', label: 'Logos & Favicon', icon: Palette },
          { id: 'hero', label: 'Hero Media', icon: Play },
          { id: 'og', label: 'Social (OG)', icon: Share2 },
          { id: 'colors', label: 'Palette', icon: Palette }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-8 py-4 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id ? "text-green border-b-2 border-green bg-green/5" : "text-muted hover:text-white"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {activeTab === 'logo' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <section className="space-y-8">
                <div>
                  <SectionLabel>LOGO VARIANTS</SectionLabel>
                  <p className="text-sm text-muted max-w-2xl">Upload your brand marks. These are propagated to the navbar, footer, and dashboards instantly.</p>
                </div>
                <div className="space-y-6">
                  <AssetUploadZone
                    label="Main Logo (Standard)"
                    description="Used on primary dark navy backgrounds."
                    currentUrl={assets.logoUrl}
                    field="logoUrl"
                    folder={MEDIA_SCHEMA.logos.path}
                    publicId="main-logo"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={2}
                    onSave={url => saveBrandAsset('logoUrl', url)}
                  />
                  <AssetUploadZone
                    label="Dark Variant Logo"
                    description="Optimized for light/white backgrounds."
                    currentUrl={assets.logoDarkUrl}
                    field="logoDarkUrl"
                    folder={MEDIA_SCHEMA.logos.path}
                    publicId="logo-dark"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={2}
                    onSave={url => saveBrandAsset('logoDarkUrl', url)}
                  />
                  <AssetUploadZone
                    label="Logo Mark (Icon Only)"
                    description="For avatars, favicons, and square UI elements."
                    currentUrl={assets.logoIconUrl}
                    field="logoIconUrl"
                    folder={MEDIA_SCHEMA.logos.path}
                    publicId="logo-icon"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={1}
                    aspectRatio="1:1"
                    previewType="icon"
                    onSave={url => saveBrandAsset('logoIconUrl', url)}
                  />
                </div>
              </section>

              <section className="space-y-8 pt-8 border-t border-white/5">
                <SectionLabel>FAVICON & TAB IDENTITY</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <AssetUploadZone
                    label="Favicon File"
                    description="The browser tab icon (SVG or 32x32 PNG)."
                    currentUrl={assets.faviconUrl}
                    field="faviconUrl"
                    folder={MEDIA_SCHEMA.logos.path}
                    publicId="favicon"
                    accept="image/svg+xml,image/png,image/x-icon"
                    maxSizeMB={1}
                    aspectRatio="1:1"
                    previewType="icon"
                    onSave={async url => {
                      await saveBrandAsset('faviconUrl', url)
                      updateFaviconInDOM(url)
                    }}
                  />
                  <div className="space-y-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">Live Context Preview</p>
                    <div className="bg-[#1e1e2e] rounded-t-xl p-4 flex items-center gap-3 border border-white/5 w-full shadow-2xl">
                       <img src={assets.faviconUrl || '/favicon.svg'} className="w-5 h-5" alt="" />
                       <span className="text-[12px] text-white font-medium truncate max-w-[200px]">AstroWave — Vibes Beyond...</span>
                       <div className="ml-auto flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white/10" />
                          <span className="text-muted text-[12px] leading-none">×</span>
                       </div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                       <p className="text-[0.65rem] text-muted italic leading-relaxed">Changes to the favicon are pushed via the <code className="text-green">DynamicFavicon</code> component, bypassing browser cache where possible.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <section className="space-y-8">
                  <div>
                    <SectionLabel>HERO BACKGROUND MEDIA</SectionLabel>
                    <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 mb-8 flex gap-4">
                       <Info size={20} className="shrink-0" />
                       <p className="leading-relaxed font-bold uppercase tracking-tight">
                         Priority Logic: The system attempts to load <span className="text-white">Video</span> &rarr; <span className="text-white">Image Fallback</span> &rarr; <span className="text-white">Gradient</span>.
                       </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <AssetUploadZone
                      label="Background Stream (Video)"
                      description="Silently loops in hero background. MP4/MOV. Max 100MB."
                      currentUrl={assets.heroVideoUrl}
                      field="heroVideoUrl"
                      folder={MEDIA_SCHEMA.heroVideos.path}
                      publicId="hero-bg"
                      accept="video/mp4,video/webm,video/mov"
                      maxSizeMB={100}
                      aspectRatio="16:9"
                      resourceType="video"
                      previewType="video"
                      onSave={url => saveBrandAsset('heroVideoUrl', url)}
                    />
                    <AssetUploadZone
                      label="Video Static Poster"
                      description="Shown while video is buffering or on low-power devices."
                      currentUrl={assets.heroPosterUrl}
                      field="heroPosterUrl"
                      folder={MEDIA_SCHEMA.backgrounds.path}
                      publicId="hero-poster"
                      accept="image/jpeg,image/png,image/webp"
                      maxSizeMB={5}
                      aspectRatio="16:9"
                      onSave={url => saveBrandAsset('heroPosterUrl', url)}
                    />
                    <AssetUploadZone
                      label="Fallback/Static Background"
                      description="Displayed if video is explicitly removed."
                      currentUrl={assets.heroImageUrl}
                      field="heroImageUrl"
                      folder={MEDIA_SCHEMA.backgrounds.path}
                      publicId="hero-image"
                      accept="image/jpeg,image/png,image/webp"
                      maxSizeMB={5}
                      aspectRatio="16:9"
                      onSave={url => saveBrandAsset('heroImageUrl', url)}
                    />
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'og' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <section className="space-y-8">
                  <SectionLabel>OPEN GRAPH (SOCIAL SHARE)</SectionLabel>
                  <p className="text-xs text-muted max-w-xl">Crucial for link previews on WhatsApp, X, and iMessage. Recommended size: <span className="text-white font-bold">1200×630px</span>.</p>
                  
                  <div className="grid grid-cols-1 gap-6">
                     {[
                       { k: 'ogImageHome', l: 'Landing Page' },
                       { k: 'ogImagePlatform', l: 'Matching Platform' },
                       { k: 'ogImageAbout', l: 'Brand Story' },
                       { k: 'ogImageEvents', l: 'Live Experiences' },
                       { k: 'ogImageManagement', l: 'Talent Portal' },
                       { k: 'ogImageContact', l: 'Contact Hub' }
                     ].map(item => (
                       <AssetUploadZone
                         key={item.k}
                         label={item.l}
                         description={`Social display card for the ${item.l}`}
                         currentUrl={assets[item.k]}
                         field={item.k}
                         folder={MEDIA_SCHEMA.backgrounds.path}
                         publicId={`og-${item.k.replace('ogImage', '').toLowerCase()}`}
                         accept="image/jpeg,image/png,image/webp"
                         maxSizeMB={3}
                         onSave={url => saveBrandAsset(item.k, url)}
                       />
                     ))}
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
               <section className="space-y-10">
                  <SectionLabel>SYSTEM PALETTE REFERENCE</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { n: 'Neon Green', h: '#00FF87', v: '--color-green' },
                      { n: 'Electric Blue', h: '#0EA5E9', v: '--color-blue' },
                      { n: 'Sky Blue', h: '#38BDF8', v: '--color-sky' },
                      { n: 'Deep Navy', h: '#020B18', v: '--color-black' },
                      { n: 'Alice White', h: '#F0F8FF', v: '--color-white' },
                      { n: 'Muted Blue', h: '#6B8CAE', v: '--color-muted' }
                    ].map(c => (
                      <div key={c.n} className="space-y-4 group">
                         <div 
                          className="h-24 rounded-xl border border-white/5 flex items-center justify-center cursor-pointer relative overflow-hidden shadow-2xl" 
                          style={{ background: c.h }}
                          onClick={() => { navigator.clipboard.writeText(c.h); }}
                         >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-all">
                               <Check size={20} className="text-white" />
                            </div>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">{c.n}</p>
                            <p className="text-[10px] text-muted font-mono mt-1">{c.h}</p>
                            <button 
                              onClick={() => navigator.clipboard.writeText(`var(${c.v})`)} 
                              className="text-[9px] text-white/20 hover:text-green font-mono uppercase mt-2 tracking-tighter transition-colors"
                            >
                              Copy Variable
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
               </section>
            </div>
          )}
        </div>

        {/* Sidebar Status */}
        <aside className="lg:col-span-4">
           <Card className="p-8 space-y-8 sticky top-32 bg-[#16161F]/60" glowColor="muted">
              <div>
                <p className="admin-label text-gold font-bold">ASSET INTEGRITY CHECK</p>
                <div className="space-y-4 mt-8">
                   {[
                     { l: 'Main Logo', v: assets.logoUrl },
                     { l: 'Icon Variant', v: assets.logoIconUrl },
                     { l: 'Favicon', v: assets.faviconUrl },
                     { l: 'Hero Video', v: assets.heroVideoUrl },
                     { l: 'OG Home', v: assets.ogImageHome },
                     { l: 'OG Platform', v: assets.ogImagePlatform }
                   ].map(item => (
                     <div key={item.l} className="flex items-center justify-between group cursor-default">
                        <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest group-hover:text-white transition-colors">{item.l}</span>
                        {item.v ? (
                          <div className="flex items-center gap-1.5 text-green text-[0.6rem] font-bold">
                            <Check size={12} /> SYNCED
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500 text-[0.6rem] font-bold">
                            <AlertCircle size={12} /> MISSING
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
              <div className="pt-8 border-t border-white/5 space-y-4">
                 <p className="text-[0.6rem] text-muted leading-relaxed font-mono uppercase tracking-tight">
                   Protocol: Branding changes are pushed to Firestore as atomic updates. Public clients resolve these URLs via real-time listeners.
                 </p>
                 <Button variant="ghost" className="w-full text-[0.6rem] h-12 border-white/5 font-bold" onClick={() => window.open('/', '_blank')}>
                    LAUNCH PUBLIC SITE <ArrowRight size={12} className="ml-2" />
                 </Button>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  )
}
