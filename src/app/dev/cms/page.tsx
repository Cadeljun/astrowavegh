'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronDown, 
  ChevronUp,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Globe,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import { 
  CMS_PAGES, 
  CMSPage,
  CMSSection,
  CMSField,
  DEFAULT_SETTINGS
} from '@/lib/cms/definitions'
import { 
  saveCMSSection,
  loadPageContent,
  saveGlobalSettings
} from '@/lib/cms/useCMS'
import { db } from '@/firebase/config'

function CMSFieldInput({
  field,
  value,
  onChange,
  hasChange
}: {
  field: CMSField
  value: string
  onChange: (val: string) => void
  hasChange: boolean
}) {
  const charCount = value?.length || 0
  const isOverLimit = field.maxLength && charCount > field.maxLength
  const isNearLimit = field.maxLength && charCount > field.maxLength * 0.85

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase text-white/50 flex items-center gap-2">
          {field.label}
          {hasChange && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166]" />}
        </label>
        {field.maxLength && (
          <span className={`font-mono text-[10px] ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/20'}`}>
            {charCount}/{field.maxLength}
          </span>
        )}
      </div>

      {field.hint && <p className="font-mono text-[10px] text-white/25 -mt-1">{field.hint}</p>}

      {field.type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`w-full px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border rounded-md font-mono text-xs text-white/80 placeholder:text-white/15 outline-none resize-none transition-all duration-200 ${hasChange ? 'border-[rgba(255,209,102,0.4)] focus:border-[#FFD166]' : 'border-[#1E1E2E] focus:border-[rgba(255,209,102,0.5)]'} ${isOverLimit ? 'border-red-400/50' : ''}`}
        />
      ) : (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`w-full px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border rounded-md font-mono text-xs text-white/80 placeholder:text-white/15 outline-none transition-all duration-200 ${hasChange ? 'border-[rgba(255,209,102,0.4)] focus:border-[#FFD166]' : 'border-[#1E1E2E] focus:border-[rgba(255,209,102,0.5)]'} ${isOverLimit ? 'border-red-400/50' : ''}`}
        />
      )}
    </div>
  )
}

function SectionAccordion({
  page,
  section,
  savedValues,
  onSaveSuccess
}: {
  page: CMSPage
  section: CMSSection
  savedValues: Record<string, string>
  onSaveSuccess: (sectionKey: string, values: Record<string, string>) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setValues(savedValues || {}) }, [savedValues])

  const hasChanges = section.fields.some(f => (values[f.key] || '') !== (savedValues[f.key] || ''))

  const updateField = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await saveCMSSection(page.slug, section.key, section.label, values)
      setSaved(true)
      onSaveSuccess(section.key, values)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-[rgba(255,209,102,0.2)] bg-[#0D0D14]' : 'border-[#1E1E2E] bg-[#0A0A0F]'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${hasChanges ? 'bg-[#FFD166]' : saved ? 'bg-green-500' : 'bg-[#1E1E2E]'}`} />
          <span className="font-mono text-sm font-semibold text-white/70">{section.label}</span>
          <span className="font-mono text-[10px] text-white/25">{section.fields.length} fields</span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && <span className="font-mono text-[10px] text-[#FFD166] bg-[rgba(255,209,102,0.1)] px-2 py-0.5 rounded-full">Unsaved</span>}
          {saved && !hasChanges && <span className="font-mono text-[10px] text-green-400 bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} />Saved</span>}
          {isOpen ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="h-px bg-[#1E1E2E] mb-4" />
          <div className="flex flex-col gap-4">
            {section.fields.map(field => (
              <CMSFieldInput key={field.key} field={field} value={values[field.key] || ''} onChange={val => updateField(field.key, val)} hasChange={(values[field.key] || '') !== (savedValues[field.key] || '')} />
            ))}
          </div>
          {error && <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"><AlertCircle size={14} className="text-red-400 flex-shrink-0" /><p className="font-mono text-xs text-red-400">{error}</p></div>}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1E1E2E]">
            {hasChanges && <button onClick={() => setValues(savedValues || {})} className="flex items-center gap-1.5 px-3 py-2 border border-[#1E1E2E] text-white/40 font-mono text-xs rounded-md hover:border-white/20 hover:text-white/60 transition-colors"><RotateCcw size={12} />Reset</button>}
            <button onClick={handleSave} disabled={saving || !hasChanges} className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-mono text-xs transition-all duration-200 ml-auto ${hasChanges && !saving ? 'bg-[rgba(255,209,102,0.15)] border border-[rgba(255,209,102,0.4)] text-[#FFD166] hover:bg-[rgba(255,209,102,0.25)]' : saved ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-green-400' : 'bg-transparent border border-[#1E1E2E] text-white/20 cursor-not-allowed'}`}>
              {saving ? <><Loader2 size={12} className="animate-spin" />Saving...</> : saved && !hasChanges ? <><Check size={12} />Saved to Firestore</> : <><Save size={12} />Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GlobalSettingsPanel() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_SETTINGS as any)
  const [savedValues, setSavedValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const snap = await loadPageContent('cms_settings', ['global'])
        if (snap.global) { setValues(snap.global as any); setSavedValues(snap.global as any) }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const hasChanges = Object.keys(values).filter(k => k !== 'updatedAt').some(k => values[k] !== savedValues[k])
  const update = (key: string, val: string) => { setValues(prev => ({ ...prev, [key]: val })); setSaved(false) }
  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const dataToSave = { ...values }; delete (dataToSave as any).updatedAt
      await saveGlobalSettings(dataToSave); setSavedValues(values); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const groups = [
    { name: 'Brand', fields: [{ key: 'siteName', label: 'Site Name', type: 'text' }, { key: 'tagline', label: 'Tagline', type: 'text' }] },
    { name: 'Contact', fields: [{ key: 'email', label: 'Email', type: 'text' }, { key: 'location', label: 'Location', type: 'text' }] },
    { name: 'Social', fields: [{ key: 'instagram', label: 'Instagram URL', type: 'url' }, { key: 'twitter', label: 'Twitter/X URL', type: 'url' }, { key: 'tiktok', label: 'TikTok URL', type: 'url' }, { key: 'youtube', label: 'YouTube URL', type: 'url' }, { key: 'facebook', label: 'Facebook URL', type: 'url' }] }
  ]

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-[#FFD166] animate-spin" /></div>

  return (
    <div className="flex flex-col gap-4">
      {groups.map(group => (
        <div key={group.name} className="bg-[#0A0A0F] rounded-xl border border-[#1E1E2E] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E1E2E] bg-[rgba(255,255,255,0.02)]"><p className="font-mono text-xs font-semibold tracking-[0.15em] uppercase text-white/30">{group.name}</p></div>
          <div className="p-4 flex flex-col gap-4">
            {group.fields.map(field => (
              <CMSFieldInput key={field.key} field={{ ...field, placeholder: (DEFAULT_SETTINGS as any)[field.key] } as any} value={values[field.key] || ''} onChange={val => update(field.key, val)} hasChange={values[field.key] !== savedValues[field.key]} />
            ))}
          </div>
        </div>
      ))}
      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]"><AlertCircle size={14} className="text-red-400" /><p className="font-mono text-xs text-red-400">{error}</p></div>}
      <button onClick={handleSave} disabled={saving || !hasChanges} className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-mono text-sm transition-all duration-200 ${hasChanges && !saving ? 'bg-[rgba(255,209,102,0.15)] border border-[rgba(255,209,102,0.4)] text-[#FFD166] hover:bg-[rgba(255,209,102,0.25)]' : saved ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-green-400' : 'bg-transparent border border-[#1E1E2E] text-white/20 cursor-not-allowed'}`}>
        {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : saved && !hasChanges ? <><Check size={14} />Settings Saved</> : <><Save size={14} />Save Global Settings</>}
      </button>
    </div>
  )
}

export default function CMSPage() {
  const [activePage, setActivePage] = useState<CMSPage>(CMS_PAGES[0])
  const [showSettings, setShowSettings] = useState(false)
  const [pageContent, setPageContent] = useState<Record<string, Record<string, string>>>({})
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    async function load() {
      setLoadingContent(true)
      try {
        const content = await loadPageContent(activePage.slug, activePage.sections.map(s => s.key))
        setPageContent(content)
      } finally { setLoadingContent(false) }
    }
    if (!showSettings) load()
  }, [activePage, showSettings])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl text-[#F8F8FF] uppercase">CMS Editor</h1>
          <p className="font-mono text-xs text-white/30 mt-1">Edit site content · Changes go live instantly</p>
        </div>
        <a href={showSettings ? '/' : `/${activePage.slug === 'home' ? '' : activePage.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1E1E2E] text-white/40 font-mono text-xs hover:border-white/20 hover:text-white/70 transition-colors">
          <ExternalLink size={12} />View Page
        </a>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {CMS_PAGES.map(page => (
          <button key={page.slug} onClick={() => { setActivePage(page); setShowSettings(false) }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0 ${!showSettings && activePage.slug === page.slug ? 'bg-[rgba(255,209,102,0.12)] text-[#FFD166] border border-[rgba(255,209,102,0.25)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'}`}>
            <span>{page.icon}</span>{page.label}
          </button>
        ))}
        <button onClick={() => setShowSettings(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0 ${showSettings ? 'bg-[rgba(168,85,247,0.12)] text-[#A855F7] border border-[rgba(168,85,247,0.25)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'}`}>
          <Globe size={12} />Global Settings
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg mb-6 bg-[rgba(255,209,102,0.05)] border border-[rgba(255,209,102,0.1)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD166] animate-pulse flex-shrink-0" />
        <p className="font-mono text-[11px] text-white/40"><span className="text-[#FFD166]">Live sync enabled.</span> Changes saved here update the public site instantly via Firestore real-time listeners. Gold dot = unsaved change.</p>
      </div>

      {showSettings ? <GlobalSettingsPanel /> : loadingContent ? (
        <div className="flex items-center justify-center py-16"><div className="flex flex-col items-center gap-3"><Loader2 size={28} className="text-[#FFD166] animate-spin" /><p className="font-mono text-xs text-white/30">Loading {activePage.label} content...</p></div></div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2"><p className="font-mono text-xs text-white/30">{activePage.sections.length} sections · {activePage.sections.reduce((acc, s) => acc + s.fields.length, 0)} total fields</p></div>
          {activePage.sections.map(section => (
            <SectionAccordion key={section.key} page={activePage} section={section} savedValues={pageContent[section.key] || {}} onSaveSuccess={(key, vals) => setPageContent(prev => ({ ...prev, [key]: vals }))} />
          ))}
        </div>
      )}
    </div>
  )
}