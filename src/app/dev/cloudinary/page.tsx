'use client'

import { useState, useEffect, 
         useCallback, useRef } from 'react'
import {
  Folder, FolderOpen, Image,
  Video, Upload, Trash2, Copy,
  RefreshCw, ChevronRight, 
  Home, Search, X, Check,
  Eye, Download, FileX,
  AlertTriangle, Loader2
} from 'lucide-react'


const ASTROWAVE_FOLDERS = [
  {
    name: 'astrowave',
    path: 'astrowave',
    children: [
      {
        name: 'events',
        path: 'astrowave/events',
        children: [
          { 
            name: 'mask-mirage', 
            path: 'astrowave/events/mask-mirage',
            color: '#A855F7'
          },
          { 
            name: 'splash-and-seduction', 
            path: 'astrowave/events/splash-and-seduction',
            color: '#06B6D4'
          },
          { 
            name: 'general', 
            path: 'astrowave/events/general',
            color: '#FFD166'
          }
        ]
      },
      {
        name: 'talent',
        path: 'astrowave/talent',
        children: [
          { 
            name: 'djs', 
            path: 'astrowave/talent/djs',
            color: '#A855F7'
          },
          { 
            name: 'artist', 
            path: 'astrowave/talent/artist',
            color: '#FFD166'
          }
        ]
      },
      {
        name: 'brand',
        path: 'astrowave/brand',
        children: [
          { 
            name: 'logos', 
            path: 'astrowave/brand/logos',
            color: '#FFD166'
          },
          { 
            name: 'backgrounds', 
            path: 'astrowave/brand/backgrounds',
            color: '#06B6D4'
          },
          { 
            name: 'graphics', 
            path: 'astrowave/brand/graphics',
            color: '#A855F7'
          }
        ]
      },
      {
        name: 'videos',
        path: 'astrowave/videos',
        children: [
          { 
            name: 'hero', 
            path: 'astrowave/videos/hero',
            color: '#FFD166'
          },
          { 
            name: 'events', 
            path: 'astrowave/videos/events',
            color: '#06B6D4'
          }
        ]
      },
      {
        name: 'gallery',
        path: 'astrowave/gallery',
        children: [
          { 
            name: 'past-events', 
            path: 'astrowave/gallery/past-events',
            color: '#A855F7'
          }
        ]
      },
      {
        name: 'coming-soon',
        path: 'astrowave/coming-soon',
        children: [
          { 
            name: 'records', 
            path: 'astrowave/coming-soon/records',
            color: '#FFD166'
          },
          { 
            name: 'cares', 
            path: 'astrowave/coming-soon/cares',
            color: '#A855F7'
          }
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
  const i = Math.floor(
    Math.log(bytes) / Math.log(k)
  )
  return parseFloat(
    (bytes / Math.pow(k, i)).toFixed(1)
  ) + ' ' + sizes[i]
}


function getFileIcon(
  resource: CloudinaryResource
) {
  if (resource.resource_type === 'video') {
    return <Video size={14} 
      className="text-[#06B6D4]" />
  }
  return <Image size={14} 
    className="text-[#FFD166]" />
}


function useCopyToClipboard() {
  const [copied, setCopied] = 
    useState<string | null>(null)
  
  const copy = useCallback(
    (text: string, id: string) => {
      navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    }, []
  )
  
  return { copied, copy }
}



export default function CloudinaryDevPage() {

  // State
  const [selectedFolder, setSelectedFolder] = 
    useState<FolderNode | null>(null)
  const [resources, setResources] = 
    useState<CloudinaryResource[]>([])
  const [loading, setLoading] = 
    useState(false)
  const [uploading, setUploading] = 
    useState(false)
  const [uploadProgress, setUploadProgress] = 
    useState<{[key: string]: number}>({})
  const [search, setSearch] = 
    useState('')
  const [viewMode, setViewMode] = 
    useState<'grid' | 'list'>('grid')
  const [selectedResource, setSelectedResource] = 
    useState<CloudinaryResource | null>(null)
  const [deleteTarget, setDeleteTarget] = 
    useState<CloudinaryResource | null>(null)
  const [deleting, setDeleting] = 
    useState(false)
  const [error, setError] = 
    useState<string | null>(null)
  const [totalCount, setTotalCount] = 
    useState(0)
  const [expandedFolders, setExpandedFolders] = 
    useState<Set<string>>(
      new Set(['astrowave'])
    )
  const { copied, copy } = useCopyToClipboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = 
    useState(false)

  // Load resources for selected folder
  const loadResources = useCallback(
    async (folder: FolderNode) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/cloudinary/folders?folder=${encodeURIComponent(folder.path)}`
        )
        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setResources(data.resources || [])
        setTotalCount(data.total || 0)
      } catch (err: any) {
        setError(err.message)
        setResources([])
      } finally {
        setLoading(false)
      }
    }, []
  )

  // Select folder
  const handleFolderSelect = (
    folder: FolderNode
  ) => {
    setSelectedFolder(folder)
    setSelectedResource(null)
    setSearch('')
    loadResources(folder)
  }

  // Toggle folder expand in sidebar
  const toggleExpand = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Upload files
  const handleUpload = async (
    files: FileList | File[]
  ) => {
    if (!selectedFolder) {
      setError(
        'Select a folder before uploading'
      )
      return
    }

    const fileArray = Array.from(files)
    setUploading(true)

    const results = await Promise.allSettled(
      fileArray.map(async (file) => {
        const fileId = `${file.name}-${Date.now()}`
        setUploadProgress(prev => ({
          ...prev, [fileId]: 0
        }))

        const formData = new FormData()
        formData.append('file', file)
        formData.append(
          'folder', 
          selectedFolder.path
        )

        try {
          setUploadProgress(prev => ({
            ...prev, [fileId]: 30
          }))

          const res = await fetch(
            '/api/cloudinary/upload',
            { method: 'POST', body: formData }
          )

          setUploadProgress(prev => ({
            ...prev, [fileId]: 80
          }))

          const data = await res.json()

          setUploadProgress(prev => ({
            ...prev, [fileId]: 100
          }))

          if (data.error) {
            throw new Error(data.error)
          }
          return data
        } catch (err) {
          setUploadProgress(prev => ({
            ...prev, [fileId]: -1
          }))
          throw err
        }
      })
    )

    // Refresh folder after uploads
    await loadResources(selectedFolder)
    setUploading(false)

    // Clear progress after 2s
    setTimeout(() => {
      setUploadProgress({})
    }, 2000)

    const failed = results.filter(
      r => r.status === 'rejected'
    ).length
    if (failed > 0) {
      setError(
        `${failed} file(s) failed to upload`
      )
    }
  }

  // Delete resource
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(
        '/api/cloudinary/delete',
        {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            publicId: deleteTarget.public_id,
            resourceType: 
              deleteTarget.resource_type
          })
        }
      )
      const data = await res.json()
      if (data.success) {
        setResources(prev => prev.filter(
          r => r.public_id !== 
            deleteTarget.public_id
        ))
        if (selectedResource?.public_id === 
            deleteTarget.public_id) {
          setSelectedResource(null)
        }
      } else {
        setError('Failed to delete file')
      }
    } catch {
      setError('Failed to delete file')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Drag and drop
  const handleDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  // Filtered resources
  const filteredResources = resources.filter(r =>
    r.public_id.toLowerCase().includes(
      search.toLowerCase()
    )
  )



  function FolderTree({ 
    nodes, 
    depth = 0 
  }: { 
    nodes: FolderNode[]
    depth?: number 
  }) {
    return (
      <>
        {nodes.map(node => {
          const hasChildren = 
            node.children && 
            node.children.length > 0
          const isExpanded = 
            expandedFolders.has(node.path)
          const isSelected = 
            selectedFolder?.path === node.path

          return (
            <div key={node.path}>
              <div
                className={`
                  flex items-center gap-1.5
                  px-2 py-1.5 rounded-md
                  cursor-pointer
                  transition-all duration-150
                  group
                  ${isSelected
                    ? 'bg-[rgba(255,209,102,0.12)] text-[#FFD166]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={{ 
                  paddingLeft: `${8 + depth * 16}px` 
                }}
              >
                {/* Expand toggle */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(node.path)
                    }}
                    className="w-4 h-4 
                      flex items-center 
                      justify-center
                      flex-shrink-0
                      hover:text-white
                      transition-transform
                      duration-200"
                    style={{
                      transform: isExpanded 
                        ? 'rotate(90deg)' 
                        : 'rotate(0deg)'
                    }}
                  >
                    <ChevronRight size={12} />
                  </button>
                ) : (
                  <span className="w-4" />
                )}

                {/* Folder icon */}
                <span 
                  className="flex-shrink-0"
                  onClick={() => 
                    handleFolderSelect(node)}
                >
                  {isExpanded && hasChildren
                    ? <FolderOpen size={14}
                        style={{ 
                          color: node.color 
                            || '#FFD166' 
                        }}
                      />
                    : <Folder size={14}
                        style={{ 
                          color: node.color 
                            || '#FFD166' 
                        }}
                      />
                  }
                </span>

                {/* Folder name */}
                <span
                  className="font-mono text-xs 
                    truncate flex-1"
                  onClick={() => 
                    handleFolderSelect(node)}
                >
                  {node.name}
                </span>
              </div>

              {/* Children */}
              {hasChildren && isExpanded && (
                <FolderTree
                  nodes={node.children!}
                  depth={depth + 1}
                />
              )}
            </div>
          )
        })}
      </>
    )
  }



  function ResourceCard({ 
    resource 
  }: { 
    resource: CloudinaryResource 
  }) {
    const isSelected = 
      selectedResource?.public_id === 
      resource.public_id
    const fileName = resource.public_id
      .split('/').pop() || resource.public_id
    const isCopied = 
      copied === resource.public_id

    return (
      <div
        onClick={() => 
          setSelectedResource(
            isSelected ? null : resource
          )}
        className={`
          relative group rounded-lg 
          overflow-hidden cursor-pointer
          border transition-all duration-200
          ${isSelected
            ? 'border-[#FFD166] shadow-[0_0_0_2px_rgba(255,209,102,0.2)]'
            : 'border-[#1E1E2E] hover:border-white/20'
          }
        `}
      >
        {/* Thumbnail */}
        <div className="
          aspect-square bg-[#0A0A0F]
          flex items-center justify-center
          overflow-hidden">
          {resource.resource_type === 'image' ? (
            <img
              src={
                resource.secure_url
                  .replace(
                    '/upload/',
                    '/upload/w_300,h_300,c_fill,q_auto,f_auto/'
                  )
              }
              alt={fileName}
              className="w-full h-full 
                object-cover
                group-hover:scale-105
                transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement)
                  .style.display = 'none'
              }}
            />
          ) : (
            <div className="flex flex-col 
              items-center gap-2">
              <Video size={32} 
                className="text-[#06B6D4]" />
              <span className="font-mono 
                text-[10px] text-white/40 
                uppercase">
                {resource.format}
              </span>
            </div>
          )}
        </div>

        {/* Overlay on hover */}
        <div className="
          absolute inset-0 
          bg-black/60 opacity-0 
          group-hover:opacity-100
          transition-opacity duration-200
          flex items-center justify-center
          gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              copy(
                resource.secure_url,
                resource.public_id
              )
            }}
            className="p-2 rounded-md
              bg-[rgba(255,209,102,0.2)]
              text-[#FFD166]
              hover:bg-[rgba(255,209,102,0.4)]
              transition-colors"
            title="Copy URL"
          >
            {isCopied 
              ? <Check size={14} /> 
              : <Copy size={14} />
            }
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(
                resource.secure_url, 
                '_blank'
              )
            }}
            className="p-2 rounded-md
              bg-white/10
              text-white
              hover:bg-white/20
              transition-colors"
            title="View original"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(resource)
            }}
            className="p-2 rounded-md
              bg-[rgba(239,68,68,0.2)]
              text-red-400
              hover:bg-[rgba(239,68,68,0.4)]
              transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* File info */}
        <div className="p-2 
          bg-[#0A0A0F] 
          border-t border-[#1E1E2E]">
          <p className="font-mono text-[10px]
            text-white/60 truncate mb-0.5">
            {fileName}
          </p>
          <div className="flex items-center 
            justify-between">
            <span className="font-mono 
              text-[9px] text-white/30 
              uppercase">
              {resource.format}
            </span>
            <span className="font-mono 
              text-[9px] text-white/30">
              {formatBytes(resource.bytes)}
            </span>
          </div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 
            left-2 w-5 h-5 rounded-full
            bg-[#FFD166] flex items-center 
            justify-center">
            <Check size={10} 
              className="text-black" />
          </div>
        )}
      </div>
    )
  }



  return (
    <div className="h-[calc(100vh-64px)] 
      flex flex-col">

      {/* Page Header */}
      <div className="flex items-center 
        justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="font-display 
            text-3xl text-[#F8F8FF] uppercase">
            Cloudinary Media
          </h1>
          <p className="font-mono text-xs 
            text-white/40 mt-1">
            {process.env
              .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
            } · Live sync with Cloudinary
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center 
          gap-2 px-3 py-1.5 rounded-full
          bg-[rgba(34,197,94,0.1)]
          border border-[rgba(34,197,94,0.2)]">
          <div className="w-1.5 h-1.5 
            rounded-full bg-green-500 
            animate-pulse" />
          <span className="font-mono text-xs 
            text-green-400">
            Connected
          </span>
        </div>
      </div>

      {/* Main layout — 3 panels */}
      <div className="flex gap-4 
        flex-1 min-h-0">

        {/* LEFT — Folder Tree (240px) */}
        <div className="w-60 flex-shrink-0
          bg-[#0A0A0F] rounded-xl
          border border-[#1E1E2E]
          overflow-y-auto">
          
          <div className="p-3 
            border-b border-[#1E1E2E]
            sticky top-0 bg-[#0A0A0F] z-10">
            <p className="font-mono text-[10px]
              tracking-widest uppercase 
              text-white/30">
              Folders
            </p>
          </div>

          <div className="p-2">
            <FolderTree 
              nodes={ASTROWAVE_FOLDERS} 
            />
          </div>
        </div>

        {/* CENTER — File Grid (flex-1) */}
        <div className="flex-1 flex flex-col 
          min-w-0 bg-[#0A0A0F] rounded-xl
          border border-[#1E1E2E]
          overflow-hidden">
          
          {/* Toolbar */}
          <div className="flex items-center 
            gap-3 p-3 
            border-b border-[#1E1E2E]
            flex-shrink-0">
            
            {/* Breadcrumb */}
            <div className="flex items-center 
              gap-1 flex-1 min-w-0">
              <Home size={12} 
                className="text-white/30 
                  flex-shrink-0" 
              />
              {selectedFolder ? (
                selectedFolder.path
                  .split('/')
                  .map((part, i, arr) => (
                    <div key={i} 
                      className="flex items-center gap-1">
                      <ChevronRight size={10} 
                        className="text-white/20" 
                      />
                      <span className={`
                        font-mono text-[11px]
                        ${i === arr.length - 1
                          ? 'text-[#FFD166]'
                          : 'text-white/40'
                        }`}>
                        {part}
                      </span>
                    </div>
                  ))
              ) : (
                <span className="font-mono 
                  text-[11px] text-white/30">
                  Select a folder
                </span>
              )}
            </div>

            {/* Search */}
            {selectedFolder && (
              <div className="relative">
                <Search size={12}
                  className="absolute left-2.5 
                    top-1/2 -translate-y-1/2 
                    text-white/30" 
                />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={e => 
                    setSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5
                    bg-white/5
                    border border-[#1E1E2E]
                    rounded-md
                    font-mono text-[11px]
                    text-white/70
                    placeholder:text-white/20
                    outline-none
                    focus:border-[#FFD166]/50
                    w-40 transition-all"
                />
              </div>
            )}

            {/* Refresh */}
            {selectedFolder && (
              <button
                onClick={() => 
                  loadResources(selectedFolder)}
                disabled={loading}
                className="p-1.5 rounded-md
                  text-white/40
                  hover:text-white/80
                  hover:bg-white/5
                  transition-colors
                  disabled:opacity-30"
              >
                <RefreshCw size={14}
                  className={loading 
                    ? 'animate-spin' 
                    : ''
                  } 
                />
              </button>
            )}

            {/* Upload button */}
            {selectedFolder && (
              <button
                onClick={() => 
                  fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center 
                  gap-1.5 px-3 py-1.5
                  bg-[rgba(255,209,102,0.1)]
                  border border-[rgba(255,209,102,0.3)]
                  text-[#FFD166]
                  font-mono text-[11px]
                  rounded-md
                  hover:bg-[rgba(255,209,102,0.2)]
                  transition-colors
                  disabled:opacity-50"
              >
                {uploading 
                  ? <Loader2 size={12} 
                      className="animate-spin" /> 
                  : <Upload size={12} />
                }
                Upload
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={e => {
                if (e.target.files) {
                  handleUpload(e.target.files)
                  e.target.value = ''
                }
              }}
              className="hidden"
            />
          </div>

          {/* File count bar */}
          {selectedFolder && !loading && (
            <div className="px-3 py-2 
              border-b border-[#1E1E2E]
              flex items-center justify-between
              flex-shrink-0">
              <span className="font-mono 
                text-[10px] text-white/30">
                {filteredResources.length} files
                {search && ` matching "${search}"`}
                {' '}
                in {selectedFolder.name}
              </span>
              {resources.length > 0 && (
                <span className="font-mono 
                  text-[10px] text-white/20">
                  {resources.reduce((acc, r) => 
                    acc + r.bytes, 0
                  ) > 0 && formatBytes(
                    resources.reduce((acc, r) => 
                      acc + r.bytes, 0
                    )
                  )}
                </span>
              )}
            </div>
          )}

          {/* Upload progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="px-3 py-2 
              border-b border-[#1E1E2E]
              bg-[rgba(255,209,102,0.05)]
              flex-shrink-0">
              {Object.entries(uploadProgress)
                .map(([id, progress]) => (
                <div key={id} className="mb-1">
                  <div className="flex 
                    justify-between mb-1">
                    <span className="font-mono 
                      text-[10px] text-white/40
                      truncate max-w-[200px]">
                      {id.split('-')[0]}
                    </span>
                    <span className="font-mono 
                      text-[10px]"
                      style={{
                        color: progress === -1 
                          ? '#ef4444'
                          : progress === 100 
                            ? '#22c55e' 
                            : '#FFD166'
                      }}
                    >
                      {progress === -1 
                        ? 'Failed' 
                        : progress === 100 
                          ? 'Done' 
                          : `${progress}%`
                      }
                    </span>
                  </div>
                  <div className="h-0.5 
                    bg-[#1E1E2E] rounded-full">
                    <div
                      className="h-full 
                        rounded-full 
                        transition-all duration-300"
                      style={{
                        width: `${Math.max(0, progress)}%`,
                        backgroundColor: 
                          progress === -1 
                            ? '#ef4444'
                            : '#FFD166'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content area */}
          <div
            ref={dropZoneRef}
            className={`flex-1 overflow-y-auto 
              p-3 transition-all duration-200
              ${isDragging 
                ? 'bg-[rgba(255,209,102,0.05)] ring-2 ring-inset ring-[rgba(255,209,102,0.3)]' 
                : ''
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 
                z-20 flex items-center 
                justify-center pointer-events-none">
                <div className="flex flex-col 
                  items-center gap-3">
                  <Upload size={40} 
                    className="text-[#FFD166]" />
                  <p className="font-mono 
                    text-sm text-[#FFD166]">
                    Drop to upload to{' '}
                    {selectedFolder?.name}
                  </p>
                </div>
              </div>
            )}

            {/* No folder selected */}
            {!selectedFolder && (
              <div className="h-full 
                flex flex-col items-center 
                justify-center gap-3">
                <Folder size={48} 
                  className="text-white/10" />
                <p className="font-mono 
                  text-sm text-white/30">
                  Select a folder to view files
                </p>
              </div>
            )}

            {/* Loading */}
            {selectedFolder && loading && (
              <div className="h-full 
                flex items-center 
                justify-center">
                <div className="flex flex-col 
                  items-center gap-3">
                  <Loader2 size={32} 
                    className="text-[#FFD166] 
                      animate-spin" 
                  />
                  <p className="font-mono 
                    text-xs text-white/30">
                    Loading from Cloudinary...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="mb-3 p-3 
                rounded-lg
                bg-[rgba(239,68,68,0.1)]
                border border-[rgba(239,68,68,0.2)]
                flex items-center gap-2">
                <AlertTriangle size={14} 
                  className="text-red-400 
                    flex-shrink-0" 
                />
                <p className="font-mono 
                  text-xs text-red-400">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto 
                    text-red-400/60 
                    hover:text-red-400">
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Empty folder */}
            {selectedFolder && 
             !loading && 
             filteredResources.length === 0 && 
             !error && (
              <div className="h-full 
                flex flex-col items-center 
                justify-center gap-3 
                min-h-[200px]">
                <FileX size={40} 
                  className="text-white/10" />
                <p className="font-mono 
                  text-sm text-white/30">
                  {search 
                    ? `No files matching "${search}"`
                    : 'This folder is empty'
                  }
                </p>
                {!search && (
                  <p className="font-mono 
                    text-xs text-white/20">
                    Drop files here or click 
                    Upload to add files
                  </p>
                )}
              </div>
            )}

            {/* File grid */}
            {selectedFolder && 
             !loading && 
             filteredResources.length > 0 && (
              <div className="grid gap-2"
                style={{
                  gridTemplateColumns: 
                    'repeat(auto-fill, minmax(140px, 1fr))'
                }}
              >
                {filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.public_id}
                    resource={resource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Detail Panel (280px) */}
        <div className="w-70 flex-shrink-0
          bg-[#0A0A0F] rounded-xl
          border border-[#1E1E2E]
          overflow-y-auto
          flex flex-col">

          {selectedResource ? (
            <>
              {/* Preview */}
              <div className="
                aspect-square bg-[#050505]
                flex items-center justify-center
                overflow-hidden flex-shrink-0
                border-b border-[#1E1E2E]">
                {selectedResource.resource_type 
                  === 'image' ? (
                  <img
                    src={selectedResource.secure_url
                      .replace(
                        '/upload/',
                        '/upload/w_400,h_400,c_fit,q_auto/'
                      )}
                    alt="Preview"
                    className="max-w-full 
                      max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedResource.secure_url}
                    controls
                    className="max-w-full 
                      max-h-full"
                  />
                )}
              </div>

              {/* File details */}
              <div className="p-4 flex-1">
                <p className="font-mono 
                  text-xs text-white/80 
                  break-all mb-4 leading-relaxed">
                  {selectedResource.public_id
                    .split('/').pop()}
                </p>

                {/* Meta rows */}
                {[
                  { 
                    label: 'Type', 
                    value: `${selectedResource.resource_type} / ${selectedResource.format?.toUpperCase()}` 
                  },
                  { 
                    label: 'Size', 
                    value: formatBytes(
                      selectedResource.bytes
                    ) 
                  },
                  selectedResource.width ? { 
                    label: 'Dimensions', 
                    value: `${selectedResource.width} × ${selectedResource.height}` 
                  } : null,
                  { 
                    label: 'Folder', 
                    value: selectedResource.folder 
                  },
                  { 
                    label: 'Uploaded', 
                    value: new Date(
                      selectedResource.created_at
                    ).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  }
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} 
                    className="flex justify-between 
                      py-1.5 
                      border-b border-white/5">
                    <span className="font-mono 
                      text-[10px] text-white/30 
                      uppercase tracking-wider">
                      {row.label}
                    </span>
                    <span className="font-mono 
                      text-[10px] text-white/60
                      text-right max-w-[140px]
                      break-all">
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* URL field */}
                <div className="mt-4">
                  <p className="font-mono 
                    text-[10px] text-white/30 
                    uppercase tracking-wider mb-2">
                    Cloudinary URL
                  </p>
                  <div className="
                    bg-[#050505] rounded-md p-2
                    border border-[#1E1E2E]
                    mb-2">
                    <p className="font-mono 
                      text-[9px] text-white/40
                      break-all leading-relaxed">
                      {selectedResource.secure_url}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(
                      selectedResource.secure_url,
                      selectedResource.public_id
                    )}
                    className="w-full flex 
                      items-center justify-center 
                      gap-2 py-2 rounded-md
                      bg-[rgba(255,209,102,0.1)]
                      border border-[rgba(255,209,102,0.2)]
                      text-[#FFD166]
                      font-mono text-xs
                      hover:bg-[rgba(255,209,102,0.2)]
                      transition-colors"
                  >
                    {copied === 
                      selectedResource.public_id 
                      ? (
                        <>
                          <Check size={12} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy URL
                        </>
                      )
                    }
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-3 
                  flex flex-col gap-2">
                  <button
                    onClick={() => window.open(
                      selectedResource.secure_url,
                      '_blank'
                    )}
                    className="w-full flex 
                      items-center justify-center 
                      gap-2 py-2 rounded-md
                      border border-[#1E1E2E]
                      text-white/50
                      font-mono text-xs
                      hover:border-white/30
                      hover:text-white/80
                      transition-colors"
                  >
                    <Eye size={12} />
                    View Original
                  </button>
                  <button
                    onClick={() => 
                      setDeleteTarget(
                        selectedResource
                      )}
                    className="w-full flex 
                      items-center justify-center 
                      gap-2 py-2 rounded-md
                      border border-[rgba(239,68,68,0.2)]
                      text-red-400/70
                      font-mono text-xs
                      hover:border-red-400/40
                      hover:text-red-400
                      transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete File
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 
              flex flex-col items-center 
              justify-center gap-3 p-6">
              <Image size={40} 
                className="text-white/10" />
              <p className="font-mono 
                text-xs text-white/30 
                text-center">
                Click a file to see details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50
          bg-black/70 backdrop-blur-sm
          flex items-center justify-center p-4">
          <div className="
            bg-[#16161F]
            border border-[#1E1E2E]
            rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-center 
              mb-4">
              <div className="w-12 h-12 
                rounded-full
                bg-[rgba(239,68,68,0.1)]
                flex items-center 
                justify-center">
                <Trash2 size={22} 
                  className="text-red-400" />
              </div>
            </div>
            <h3 className="font-display 
              text-xl text-white text-center 
              uppercase mb-2">
              Delete File
            </h3>
            <p className="font-mono text-xs 
              text-white/40 text-center 
              mb-1 break-all">
              {deleteTarget.public_id
                .split('/').pop()}
            </p>
            <p className="font-mono text-xs 
              text-white/30 text-center mb-6">
              This permanently removes the file 
              from Cloudinary. Cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => 
                  setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5
                  border border-[#1E1E2E]
                  text-white/50
                  font-mono text-xs
                  rounded-md
                  hover:border-white/30
                  hover:text-white/80
                  transition-colors
                  disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5
                  bg-red-500 hover:bg-red-600
                  text-white
                  font-mono text-xs
                  rounded-md
                  transition-colors
                  disabled:opacity-40
                  flex items-center 
                  justify-center gap-2"
              >
                {deleting 
                  ? <><Loader2 size={12} 
                      className="animate-spin" 
                    /> Deleting...</> 
                  : 'Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
