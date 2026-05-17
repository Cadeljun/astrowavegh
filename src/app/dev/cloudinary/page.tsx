'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Folder, FolderOpen, Image,
  Video, Upload, Trash2, Copy,
  RefreshCw, ChevronRight, 
  Home, Search, X, Check,
  Eye, FileX, AlertTriangle, Loader2
} from 'lucide-react'
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useToast } from '@/hooks/use-toast'

const ASTROWAVE_FOLDERS = [
  {
    name: 'astrowave',
    path: 'astrowave',
    children: [
      {
        name: 'events',
        path: 'astrowave/events',
        children: [
          { name: 'mask-mirage', path: 'astrowave/events/mask-mirage', color: '#A855F7' },
          { name: 'splash-and-seduction', path: 'astrowave/events/splash-and-seduction', color: '#06B6D4' },
          { name: 'general', path: 'astrowave/events/general', color: '#FFD166' }
        ]
      },
      {
        name: 'talent',
        path: 'astrowave/talent',
        children: [
          { name: 'djs', path: 'astrowave/talent/djs', color: '#A855F7' },
          { name: 'artist', path: 'astrowave/talent/artist', color: '#FFD166' }
        ]
      },
      {
        name: 'brand',
        path: 'astrowave/brand',
        children: [
          { name: 'logos', path: 'astrowave/brand/logos', color: '#FFD166' },
          { name: 'backgrounds', path: 'astrowave/brand/backgrounds', color: '#06B6D4' },
          { name: 'graphics', path: 'astrowave/brand/graphics', color: '#A855F7' }
        ]
      },
      {
        name: 'videos',
        path: 'astrowave/videos',
        children: [
          { name: 'hero', path: 'astrowave/videos/hero', color: '#FFD166' },
          { name: 'events', path: 'astrowave/videos/events', color: '#06B6D4' }
        ]
      }
    ]
  }
]

interface CloudinaryResource {
  public_id: string
  secure_url: string
  format: string
  resource_type: 'image' | 'video'
  bytes: number
  width?: number
  height?: number
  created_at: string
  folder: string
}

interface FolderNode {
  name: string
  path: string
  color?: string
  children?: FolderNode[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function CloudinaryDevPage() {
  const { toast } = useToast()
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null)
  const [resources, setResources] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [search, setSearch] = useState('')
  const [selectedResource, setSelectedResource] = useState<CloudinaryResource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CloudinaryResource | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['astrowave']))
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const loadResources = useCallback(async (folder: FolderNode) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/cloudinary/folders?folder=${encodeURIComponent(folder.path)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResources(data.resources || [])
    } catch (err: any) {
      setError(err.message)
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFolderSelect = (folder: FolderNode) => {
    setSelectedFolder(folder)
    setSelectedResource(null)
    setSearch('')
    loadResources(folder)
  }

  const toggleExpand = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  const handleUpload = async (files: FileList | File[]) => {
    if (!selectedFolder) {
      toast({ variant: 'destructive', title: 'Action Denied', description: 'Select a destination folder first.' })
      return
    }

    const fileArray = Array.from(files)
    setUploading(true)

    for (const file of fileArray) {
      const fileId = `${file.name}-${Date.now()}`
      setUploadProgress(prev => ({ ...prev, [fileId]: 10 }))

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', selectedFolder.path)

      try {
        const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        setUploadProgress(prev => ({ ...prev, [fileId]: 80 }))

        // ADD TO FIRESTORE REGISTRY
        await addDoc(collection(db, 'uploads'), {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          cloudinaryUrl: data.url,
          publicId: data.publicId,
          folder: selectedFolder.path,
          uploadedAt: serverTimestamp()
        })

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        toast({ title: 'Upload Success', description: `${file.name} is now registered.` })
      } catch (err: any) {
        setUploadProgress(prev => ({ ...prev, [fileId]: -1 }))
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.message })
      }
    }

    await loadResources(selectedFolder)
    setUploading(false)
    setTimeout(() => setUploadProgress({}), 3000)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      // 1. Delete from Cloudinary
      const res = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: deleteTarget.public_id, resourceType: deleteTarget.resource_type })
      })
      const data = await res.json()

      if (data.success) {
        // 2. Remove from Firestore registry if it exists
        const q = query(collection(db, 'uploads'), where('publicId', '==', deleteTarget.public_id))
        const snap = await getDocs(q)
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, 'uploads', docSnap.id))
        }

        setResources(prev => prev.filter(r => r.public_id !== deleteTarget.public_id))
        if (selectedResource?.public_id === deleteTarget.public_id) setSelectedResource(null)
        toast({ title: 'File Terminated', description: 'Resource removed from Cloudinary and Firestore.' })
      } else {
        throw new Error('Cloudinary deletion failed')
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredResources = resources.filter(r =>
    r.public_id.toLowerCase().includes(search.toLowerCase())
  )

  function FolderTree({ nodes, depth = 0 }: { nodes: FolderNode[], depth?: number }) {
    return (
      <>
        {nodes.map(node => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedFolders.has(node.path)
          const isSelected = selectedFolder?.path === node.path

          return (
            <div key={node.path}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all group ${isSelected ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                style={{ paddingLeft: `${8 + depth * 16}px` }}
                onClick={() => handleFolderSelect(node)}
              >
                {hasChildren ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(node.path) }}
                    className={`w-4 h-4 flex items-center justify-center hover:text-white transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  >
                    <ChevronRight size={12} />
                  </button>
                ) : <span className="w-4" />}
                <span className="flex-shrink-0">
                  {isExpanded && hasChildren ? <FolderOpen size={14} style={{ color: node.color || '#06B6D4' }} /> : <Folder size={14} style={{ color: node.color || '#06B6D4' }} />}
                </span>
                <span className="font-mono text-[11px] truncate flex-1 uppercase tracking-tighter">{node.name}</span>
              </div>
              {hasChildren && isExpanded && <FolderTree nodes={node.children!} depth={depth + 1} />}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="font-display text-4xl text-[#F8F8FF] uppercase">CLOUDINARY COMMAND</h1>
          <p className="font-mono text-[0.6rem] text-cyan-500/40 uppercase tracking-[0.2em] mt-1">Live Asset Management & Registry Sync</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-cyan-500/5 border border-cyan-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono text-[0.65rem] text-cyan-400 uppercase font-bold tracking-widest">Link Active</span>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-[#08080C] rounded-sm border border-white/5 overflow-y-auto p-4 space-y-4">
          <p className="font-mono text-[0.6rem] text-white/20 uppercase tracking-[0.2em] mb-2 font-bold">DIRECTORY_MAP</p>
          <FolderTree nodes={ASTROWAVE_FOLDERS} />
        </div>

        {/* Browser */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#08080C] rounded-sm border border-white/5 overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-black/20">
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <Home size={14} className="text-white/20" />
              {selectedFolder?.path.split('/').map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronRight size={12} className="text-white/10" />
                  <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold whitespace-nowrap">{p}</span>
                </div>
              ))}
            </div>
            {selectedFolder && (
              <div className="flex items-center gap-2">
                <input 
                  type="text" placeholder="Filter..." 
                  className="admin-input h-9 w-40 text-[10px] bg-white/5" 
                  value={search} onChange={e => setSearch(e.target.value)} 
                />
                <button onClick={() => loadResources(selectedFolder)} className="p-2 text-white/30 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                >
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} UPLOAD
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
              </div>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto p-6 ${isDragging ? 'bg-cyan-500/5' : ''}`}>
            {!selectedFolder ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20"><Folder size={48} className="mb-4" /><p className="font-mono text-xs tracking-widest uppercase">Select folder to browse</p></div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4"><Loader2 size={32} className="animate-spin text-cyan-500" /><p className="font-mono text-[0.6rem] text-cyan-500 uppercase tracking-widest animate-pulse">Requesting resources...</p></div>
            ) : filteredResources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10"><FileX size={48} className="mb-4" /><p className="font-mono text-xs tracking-widest uppercase">{search ? 'No matches' : 'Folder is empty'}</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredResources.map(res => (
                  <div 
                    key={res.public_id} 
                    onClick={() => setSelectedResource(res)}
                    className={`group relative aspect-square rounded-sm border transition-all cursor-pointer overflow-hidden ${selectedResource?.public_id === res.public_id ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    {res.resource_type === 'image' ? (
                      <img src={res.secure_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/40"><Video size={32} className="text-cyan-500" /><span className="text-[0.5rem] font-bold text-white/20 uppercase tracking-widest">VIDEO_SRC</span></div>
                    )}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); copyUrl(res.secure_url, res.public_id) }} className="p-2 bg-white/10 hover:bg-cyan-500 hover:text-black rounded-sm transition-all">{copiedId === res.public_id ? <Check size={14} /> : <Copy size={14} />}</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(res) }} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-all"><Trash2 size={14} /></button>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-white truncate font-bold uppercase">{res.public_id.split('/').pop()}</p>
                        <p className="font-mono text-[8px] text-white/30 uppercase mt-1">{formatBytes(res.bytes)} • {res.format}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0A0A0F] border border-red-500/20 p-8 rounded-sm shadow-2xl space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20"><Trash2 size={32} /></div>
              <div>
                <h3 className="font-display text-2xl text-white uppercase tracking-widest">Destroy Asset?</h3>
                <p className="font-mono text-[0.6rem] text-red-400 uppercase tracking-widest mt-1">This operation is irreversible.</p>
              </div>
            </div>
            <div className="p-4 bg-black/40 rounded-sm border border-white/5 space-y-2">
              <p className="font-mono text-[10px] text-white/40 uppercase">Target ID:</p>
              <p className="font-mono text-[10px] text-white truncate">{deleteTarget.public_id}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 h-12 font-mono text-xs uppercase tracking-widest border border-white/10 hover:border-white/30 text-white/40 transition-all">Abort</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 h-12 font-mono text-xs uppercase tracking-widest bg-red-500 text-white font-bold hover:bg-red-600 transition-all">
                {deleting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
