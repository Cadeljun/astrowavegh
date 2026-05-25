'use client'

import { useState, useEffect } from 'react'
import { 
  Image, Globe, Monitor,
  Smartphone, Share2, Play,
  Palette, RefreshCw, Check,
  AlertCircle, Loader2, ExternalLink
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
    const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]']
    selectors.forEach(selector => {
      const links = document.querySelectorAll(selector)
      links.forEach(link => { (link as HTMLLinkElement).href = url })
      if (links.length === 0) {
        const link = document.createElement('link')
        link.rel = 'icon'
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
    return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-green" /></div>
  }

  const configuredCount = Object.keys(assets).filter(k => assets[k] && k.toLowerCase().includes('url')).length
  const totalAssets = 14

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="display-md text-white">BRAND ASSETS</h1>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mt-1">Logos, Favicons, and Social Identities</p>
        </div>
        <Button variant="ghost" size="sm" className="border border-white/5" onClick={loadAssets}>
          <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} /> REFRESH
        </Button>
      </header>

      {/* Progress */}
      <Card className="p-6" glowColor="green">
        <div className="flex justify-between items-end mb-4">
          <p className="font-mono text-xs text-white uppercase font-bold">{configuredCount} of {totalAssets} assets configured</p>
          <span className="text-green font-mono text-xs">{Math.round((configuredCount / totalAssets) * 100)}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-green shadow-[0_0_15px_var(--color-green)] transition-all duration-1000" style={{ width: `${(configuredCount / totalAssets) * 100}%` }} />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-white/5">
        {[
          { id: 'logo', label: 'Logo & Favicon', icon: Palette },
          { id: 'hero', label: 'Hero Media', icon: Play },
          { id: 'og', label: 'Social (OG)', icon: Share2 },
          { id: 'colors', label: 'Palette', icon: Palette }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-all",
              activeTab === tab.id ? "text-green border-b-2 border-green" : "text-muted hover:text-white"
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {activeTab === 'logo' && (
            <div className="space-y-12">
              <section className="space-y-6">
                <div>
                  <SectionLabel>LOGO VARIANTS</SectionLabel>
                  <p className="text-sm text-muted">Upload your brand marks in various formats for different UI contexts.</p>
                </div>
                <div className="space-y-6">
                  <AssetUploadZone
                    label="Main Logo"
                    description="Standard variant for deep navy backgrounds. Recommended: SVG or PNG transparent"
                    currentUrl={assets.logoUrl}
                    field="logoUrl"
                    folder="astrowave/brand/logos"
                    publicId="main-logo"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={2}
                    onSave={url => saveBrandAsset('logoUrl', url)}
                  />
                  <AssetUploadZone
                    label="Dark Logo"
                    description="Variant optimized for light/white backgrounds."
                    currentUrl={assets.logoDarkUrl}
                    field="logoDarkUrl"
                    folder="astrowave/brand/logos"
                    publicId="logo-dark"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={2}
                    onSave={url => saveBrandAsset('logoDarkUrl', url)}
                  />
                  <AssetUploadZone
                    label="Logo Icon"
                    description="Mark only without text. Used for PWA and square spaces."
                    currentUrl={assets.logoIconUrl}
                    field="logoIconUrl"
                    folder="astrowave/brand/logos"
                    publicId="logo-icon"
                    accept="image/svg+xml,image/png,image/webp"
                    maxSizeMB={1}
                    aspectRatio="1:1"
                    previewType="icon"
                    onSave={url => saveBrandAsset('logoIconUrl', url)}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <SectionLabel>FAVICON & BROWSER TAB</SectionLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AssetUploadZone
                    label="Favicon File"
                    description="Primary browser icon. SVG or 32x32 PNG."
                    currentUrl={assets.faviconUrl}
                    field="faviconUrl"
                    folder="astrowave/brand/logos"
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
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Tab Preview</p>
                    <div className="bg-[#1e1e2e] rounded-t-lg p-3 flex items-center gap-3 border border-white/5 w-fit">
                       <img src={assets.faviconUrl || '/favicon.svg'} className="w-4 h-4" alt="" />
                       <span className="text-[11px] text-white truncate max-w-[150px]">AstroWave — Vibes Beyond...</span>
                       <span className="text-muted text-[11px]">×</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-12">
               <section className="space-y-6">
                  <div>
                    <SectionLabel>HERO BACKGROUND MEDIA</SectionLabel>
                    <div className="p-4 bg-blue/5 border border-blue/20 rounded-lg text-xs text-blue-400 mb-6">
                       <strong>Priority:</strong> Video → Image → Gradient fallback.
                    </div>
                  </div>
                  <div className="space-y-6">
                    <AssetUploadZone
                      label="Background Video"
                      description="Silently loops in background. MP4 recommended. Max 100MB."
                      currentUrl={assets.heroVideoUrl}
                      field="heroVideoUrl"
                      folder="astrowave/videos/hero"
                      publicId="hero-bg"
                      accept="video/mp4,video/webm"
                      maxSizeMB={100}
                      aspectRatio="16:9"
                      resourceType="video"
                      previewType="video"
                      onSave={url => saveBrandAsset('heroVideoUrl', url)}
                    />
                    <AssetUploadZone
                      label="Video Poster"
                      description="Static fallback while video loads or on mobile."
                      currentUrl={assets.heroPosterUrl}
                      field="heroPosterUrl"
                      folder="astrowave/brand/backgrounds"
                      publicId="hero-poster"
                      accept="image/jpeg,image/png,image/webp"
                      maxSizeMB={5}
                      aspectRatio="16:9"
                      onSave={url => saveBrandAsset('heroPosterUrl', url)}
                    />
                    <AssetUploadZone
                      label="Fallback Image"
                      description="Shown if no video is provided."
                      currentUrl={assets.heroImageUrl}
                      field="heroImageUrl"
                      folder="astrowave/brand/backgrounds"
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
            <div className="space-y-12">
               <section className="space-y-6">
                  <SectionLabel>SOCIAL SHARE (OPEN GRAPH)</SectionLabel>
                  <p className="text-xs text-muted">Required size: 1200×630px. Aspect ratio 1.91:1.</p>
                  
                  <div className="grid grid-cols-1 gap-8">
                     {[
                       { k: 'ogImageHome', l: 'Home Page' },
                       { k: 'ogImageAbout', l: 'About Page' },
                       { k: 'ogImageEvents', l: 'Events Page' },
                       { k: 'ogImageManagement', l: 'Management Page' },
                       { k: 'ogImageContact', l: 'Contact Page' },
                       { k: 'ogImagePlatform', l: 'Platform Discovery' }
                     ].map(item => (
                       <AssetUploadZone
                         key={item.k}
                         label={item.l}
                         description={`Social preview image for ${item.l}`}
                         currentUrl={assets[item.k]}
                         field={item.k}
                         folder="astrowave/brand/og"
                         publicId={item.k.replace('ogImage', 'og-').toLowerCase()}
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
            <div className="space-y-12">
               <section className="space-y-8">
                  <SectionLabel>BRAND PALETTE</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { n: 'Neon Green', h: '#00FF87', v: '--color-green' },
                      { n: 'Electric Blue', h: '#0EA5E9', v: '--color-blue' },
                      { n: 'Sky Blue', h: '#38BDF8', v: '--color-sky' },
                      { n: 'Deep Navy', h: '#020B18', v: '--color-black' },
                      { n: 'Alice White', h: '#F0F8FF', v: '--color-white' },
                      { n: 'Blue Muted', h: '#6B8CAE', v: '--color-muted' }
                    ].map(c => (
                      <div key={c.n} className="space-y-3 group">
                         <div className="h-16 rounded-lg border border-white/5 flex items-center justify-center cursor-pointer relative overflow-hidden" style={{ background: c.h }}>
                            <button onClick={() => navigator.clipboard.writeText(c.h)} className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-all">
                               <Check size={16} className="text-white" />
                            </button>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white uppercase">{c.n}</p>
                            <p className="text-[10px] text-muted font-mono">{c.h}</p>
                            <button onClick={() => navigator.clipboard.writeText(`var(${c.v})`)} className="text-[9px] text-muted hover:text-green font-mono uppercase mt-1">Copy Var</button>
                         </div>
                      </div>
                    ))}
                  </div>
               </section>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
           <Card className="p-8 space-y-8 sticky top-32" glowColor="muted">
              <div>
                <p className="admin-label">ASSET CHECKLIST</p>
                <div className="space-y-4 mt-6">
                   {[
                     { l: 'Main Logo', v: assets.logoUrl },
                     { l: 'Favicon', v: assets.faviconUrl },
                     { l: 'Dark Logo', v: assets.logoDarkUrl },
                     { l: 'Logo Icon', v: assets.logoIconUrl },
                     { l: 'Hero Video', v: assets.heroVideoUrl },
                     { l: 'OG Home', v: assets.ogImageHome },
                     { l: 'OG Platform', v: assets.ogImagePlatform }
                   ].map(item => (
                     <div key={item.l} className="flex items-center justify-between group cursor-default">
                        <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">{item.l}</span>
                        {item.v ? <Check size={14} className="text-green" /> : <AlertCircle size={14} className="text-red-400" />}
                     </div>
                   ))}
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                 <p className="text-[0.65rem] text-muted leading-relaxed font-mono">Changes saved to brand assets are propagated across all nodes instantly via Firestore.</p>
                 <Button variant="ghost" className="w-full text-[0.6rem] h-10 border-white/5" onClick={() => window.open('/', '_blank')}>PREVIEW PUBLIC SITE</Button>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  )
}
