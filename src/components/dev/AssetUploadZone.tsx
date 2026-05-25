'use client'

import { useState, useRef } from 'react'
import { Upload, Check, X, Loader2, ExternalLink } from 'lucide-react'

interface AssetUploadZoneProps {
  label: string
  description: string
  currentUrl: string
  field: string
  folder: string
  publicId?: string
  accept: string
  maxSizeMB: number
  aspectRatio?: string
  resourceType?: 'image' | 'video' | 'raw'
  previewType?: 'image' | 'video' | 'icon'
  onSave: (url: string) => Promise<void>
  onSuccess?: (url: string) => void
}

export default function AssetUploadZone({
  label,
  description,
  currentUrl,
  field,
  folder,
  publicId,
  accept,
  maxSizeMB,
  aspectRatio,
  resourceType = 'image',
  previewType = 'image',
  onSave,
  onSuccess
}: AssetUploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(currentUrl)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB`)
      return
    }

    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      if (resourceType !== 'video') {
        const reader = new FileReader()
        reader.onload = e => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }

      setProgress(30)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      formData.append('resourceType', resourceType)
      if (publicId) {
        formData.append('publicId', publicId)
      }

      setProgress(50)

      const res = await fetch('/api/cloudinary/upload-brand', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setProgress(80)

      await onSave(data.url)

      setProgress(100)
      setPreview(data.url)
      setSaved(true)
      onSuccess?.(data.url)

      setTimeout(() => {
        setSaved(false)
        setProgress(0)
      }, 3000)

    } catch (err: any) {
      setError(err.message)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'rgba(4,16,32,0.6)',
        border: isDragging
          ? '1px solid rgba(0,255,135,0.4)'
          : saved
            ? '1px solid rgba(0,255,135,0.3)'
            : '1px solid #0F2040'
      }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: '#0F2040' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm font-semibold text-white">{label}</p>
            <p className="font-mono text-[10px] mt-0.5 text-muted">{description}</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10 border border-green/30">
              <Check size={12} className="text-green" />
              <span className="font-mono text-[10px] text-green">Saved</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-5 flex-col lg:flex-row">
          <div className="flex-shrink-0">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted">Current</p>
            <div
              className="rounded-xl overflow-hidden flex items-center justify-center relative"
              style={{
                width: previewType === 'icon' ? '80px' : '200px',
                height: previewType === 'icon' ? '80px' : aspectRatio === '16:9' ? '113px' : aspectRatio === '1:1' ? '200px' : '80px',
                background: '#020B18',
                border: '1px solid #0F2040'
              }}
            >
              {preview ? (
                previewType === 'video' ? (
                  <video src={preview} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <img src={preview} alt={label} className="max-w-full max-h-full object-contain" />
                )
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={20} className="text-muted" />
                  <span className="font-mono text-[9px] text-center px-2 text-muted">No file</span>
                </div>
              )}
            </div>

            {preview && (
              <a
                href={preview}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-2 font-mono text-[10px] text-muted hover:text-green transition-colors"
              >
                <ExternalLink size={10} />
                View full
              </a>
            )}
          </div>

          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted">Upload New</p>
            <div
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-6 cursor-pointer transition-all duration-200 min-h-[120px]"
              style={{
                borderColor: isDragging ? '#00FF87' : '#0F2040',
                background: isDragging ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.02)'
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <Loader2 size={24} className="animate-spin text-green" />
                  <p className="font-mono text-xs text-muted">Uploading... {progress}%</p>
                  <div className="w-full h-1 rounded-full bg-muted/20">
                    <div className="h-full rounded-full transition-all duration-300 bg-green" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={22} className="text-muted" />
                  <div className="text-center">
                    <p className="font-mono text-xs text-white">Drop file here or <span className="text-green">click to browse</span></p>
                    <p className="font-mono text-[10px] mt-1 text-muted">
                      {accept.replace(/image\//g, '').toUpperCase()} · Max {maxSizeMB}MB {aspectRatio && ` · ${aspectRatio}`}
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <X size={13} className="text-red-400 flex-shrink-0" />
                <p className="font-mono text-xs text-red-400">{error}</p>
              </div>
            )}

            {preview && (
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1 text-muted">URL</p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black border border-border">
                  <p className="font-mono text-[10px] flex-1 truncate text-muted">{preview}</p>
                  <button
                    onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(preview) }}
                    className="flex-shrink-0 font-mono text-[10px] text-muted hover:text-green transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = '' }} />
    </div>
  )
}
