'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Grid } from 'lucide-react'
import { addDocument, updateDocument, getDocument } from '@/lib/firebase/helpers'
import { useToast } from '@/hooks/use-toast'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import CloudinaryImage from '@/components/ui/CloudinaryImage'

interface EventFormProps {
  eventId?: string
}

interface EventData {
  name: string
  category: string
  date: string
  venue: string
  ticketLink: string
  shortDescription: string
  fullDescription: string
  imageUrl: string
  active: boolean
}

const defaultData: EventData = {
  name: '',
  category: 'Nightlife',
  date: '',
  venue: '',
  ticketLink: '',
  shortDescription: '',
  fullDescription: '',
  imageUrl: '',
  active: true
}

const categories = ['Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals', 'Other']

export default function EventForm({ eventId }: EventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = !!eventId
  const [data, setData] = useState<EventData>(defaultData)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  useEffect(() => {
    if (!eventId) return
    async function loadEvent() {
      try {
        const event = await getDocument('events', eventId)
        if (event) {
          const e = event as any
          setData({
            name: e.name || '',
            category: e.category || 'Nightlife',
            date: e.date?.toDate ? e.date.toDate().toISOString().slice(0, 16) : e.date || '',
            venue: e.venue || '',
            ticketLink: e.ticketLink || '',
            shortDescription: e.shortDescription || '',
            fullDescription: e.fullDescription || '',
            imageUrl: e.imageUrl || '',
            active: e.active ?? true
          })
          if (e.imageUrl) setImagePreview(e.imageUrl)
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to load event" })
      } finally {
        setFetchLoading(false)
      }
    }
    loadEvent()
  }, [eventId, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    update('imageUrl', '') // Clear existing URL to prioritize upload
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'astrowave_preset')
    formData.append('folder', `astrowave/events/${data.category.toLowerCase().replace(' ', '-')}`)

    setUploadProgress(10)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
    const result = await res.json()
    if (!result.secure_url) throw new Error('Upload failed')
    return result.secure_url
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!data.name || !data.venue) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all required fields" })
      return
    }

    setLoading(true)
    try {
      let imageUrl = data.imageUrl
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const eventData = { ...data, imageUrl, date: data.date ? new Date(data.date) : null }

      if (isEdit && eventId) {
        updateDocument('events', eventId, eventData)
        toast({ title: "Updated", description: "Event changes saved." })
      } else {
        addDocument('events', eventData)
        toast({ title: "Created", description: "New event added." })
      }
      setTimeout(() => router.push('/admin/events'), 1000)
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" })
    } finally {
      setLoading(false)
    }
  }

  const update = (field: keyof EventData, value: any) => setData(prev => ({ ...prev, [field]: value }))

  if (fetchLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-gold" /></div>

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <button type="button" onClick={() => router.push('/admin/events')} className="flex items-center gap-2 text-sm text-muted hover:text-white mb-4"><ArrowLeft size={16} /> Back to Events</button>
        <h1 className="display-md text-white">{isEdit ? 'Edit Event' : 'Add Event'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card space-y-6">
            <div className="space-y-4">
              <label className="admin-label">Event Name *</label>
              <input type="text" value={data.name} onChange={e => update('name', e.target.value)} required className="admin-input" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="admin-label">Category *</label>
                  <select value={data.category} onChange={e => update('category', e.target.value)} className="admin-input">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="admin-label">Date & Time</label>
                  <input type="datetime-local" value={data.date} onChange={e => update('date', e.target.value)} className="admin-input [color-scheme:dark]" />
                </div>
              </div>

              <label className="admin-label">Venue *</label>
              <input type="text" value={data.venue} onChange={e => update('venue', e.target.value)} required className="admin-input" />
            </div>
          </div>

          <div className="admin-card space-y-6">
             <label className="admin-label">Short Description</label>
             <textarea value={data.shortDescription} onChange={e => update('shortDescription', e.target.value.slice(0, 200))} rows={3} className="admin-input resize-none" />
             <label className="admin-label">Full Details</label>
             <textarea value={data.fullDescription} onChange={e => update('fullDescription', e.target.value)} rows={5} className="admin-input resize-none" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <label className="admin-label">Event Poster</label>
            <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-black/40 border border-white/5">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-2">
                   <Upload size={32} />
                   <p className="text-[0.6rem] uppercase">No Image</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
               <label className="w-full h-11 flex items-center justify-center gap-2 border border-white/10 rounded-sm text-[0.7rem] font-bold uppercase tracking-widest hover:bg-white/5 cursor-pointer transition-all">
                 <Upload size={14} /> Upload New
                 <input type="file" onChange={handleImageChange} className="hidden" />
               </label>
               <button type="button" onClick={() => setIsPickerOpen(true)} className="w-full h-11 flex items-center justify-center gap-2 border border-gold/20 text-gold rounded-sm text-[0.7rem] font-bold uppercase tracking-widest hover:bg-gold/5 transition-all">
                 <Grid size={14} /> Library
               </button>
            </div>
            
            {uploadProgress > 0 && <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gold" style={{ width: `${uploadProgress}%` }} /></div>}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14">
            {loading ? <Loader2 className="animate-spin" /> : 'SAVE EVENT'}
          </Button>
        </div>
      </form>

      <MediaPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(url) => {
          update('imageUrl', url);
          setImagePreview(url);
          setImageFile(null);
        }}
        folders={[
          'astrowave/events/general',
          'astrowave/events/mask-mirage',
          'astrowave/events/splash-and-seduction'
        ]}
      />
    </div>
  )
}
