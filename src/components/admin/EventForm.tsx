'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Grid, Plus, Trash2 } from 'lucide-react'
import { addDocument, updateDocument, getDocument } from '@/lib/firebase/helpers'
import { useToast } from '@/hooks/use-toast'
import MediaPickerModal from '@/components/admin/MediaPickerModal'
import CloudinaryImage from '@/components/ui/CloudinaryImage'

interface EventFormProps {
  eventId?: string
}

interface TicketTier {
  tierId: string
  name: string
  price: number
  quantity: number
  sold: number
}

interface EventData {
  title: string
  category: string
  date: string
  venue: string
  city: string
  description: string
  coverImage: string
  slug: string
  status: 'draft' | 'published'
  salesStartDate: string
  salesEndDate: string
  ticketTiers: TicketTier[]
}

const defaultData: EventData = {
  title: '',
  category: 'Nightlife',
  date: '',
  venue: '',
  city: 'Accra',
  description: '',
  coverImage: '',
  slug: '',
  status: 'draft',
  salesStartDate: '',
  salesEndDate: '',
  ticketTiers: [{ tierId: 'tier-1', name: 'General Admission', price: 50, quantity: 100, sold: 0 }],
}

const categories = ['Parties', 'Concerts', 'Nightlife', 'Networking', 'Festivals', 'Other']

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

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
            title: e.title || '',
            category: e.category || 'Nightlife',
            date: e.date?.toDate ? e.date.toDate().toISOString().slice(0, 16) : e.date || '',
            venue: e.venue || '',
            city: e.city || 'Accra',
            description: e.description || '',
            coverImage: e.coverImage || '',
            slug: e.slug || '',
            status: e.status || 'draft',
            salesStartDate: e.salesStartDate?.toDate ? e.salesStartDate.toDate().toISOString().slice(0, 16) : e.salesStartDate || '',
            salesEndDate: e.salesEndDate?.toDate ? e.salesEndDate.toDate().toISOString().slice(0, 16) : e.salesEndDate || '',
            ticketTiers: e.ticketTiers || [],
          })
          if (e.coverImage) setImagePreview(e.coverImage)
        }
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load event' })
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
    update('coverImage', '')
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'astrowave_preset')
    formData.append('folder', `Astrowave/Events/${data.slug || 'general'}`)

    setUploadProgress(10)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
    const result = await res.json()
    if (!result.secure_url) throw new Error('Upload failed')
    return result.secure_url
  }

  const addTier = () => {
    const newTier: TicketTier = {
      tierId: `tier-${Date.now()}`,
      name: '',
      price: 0,
      quantity: 0,
      sold: 0,
    }
    setData(prev => ({ ...prev, ticketTiers: [...prev.ticketTiers, newTier] }))
  }

  const removeTier = (index: number) => {
    if (data.ticketTiers.length <= 1) {
      toast({ variant: 'destructive', title: 'Error', description: 'At least one ticket tier required' })
      return
    }
    setData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter((_, i) => i !== index)
    }))
  }

  const updateTier = (index: number, field: keyof TicketTier, value: any) => {
    setData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!data.title || !data.venue || !data.date) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields' })
      return
    }

    // Validate tiers
    for (const tier of data.ticketTiers) {
      if (!tier.name || tier.price <= 0 || tier.quantity <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'All ticket tiers need name, price, and quantity' })
        return
      }
    }

    setLoading(true)
    try {
      let coverImage = data.coverImage
      if (imageFile) {
        coverImage = await uploadImage(imageFile)
      }

      const slug = data.slug || generateSlug(data.title)

      const eventData = {
        ...data,
        coverImage,
        slug,
        date: data.date ? new Date(data.date) : null,
        salesStartDate: data.salesStartDate ? new Date(data.salesStartDate) : null,
        salesEndDate: data.salesEndDate ? new Date(data.salesEndDate) : null,
      }

      if (isEdit && eventId) {
        updateDocument('events', eventId, eventData)
        toast({ title: 'Updated', description: 'Event changes saved.' })
      } else {
        addDocument('events', eventData)
        toast({ title: 'Created', description: 'New event added.' })
      }
      setTimeout(() => router.push('/admin/events'), 1000)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed' })
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
          {/* Basic Info */}
          <div className="admin-card space-y-6">
            <div className="space-y-4">
              <label className="admin-label">Event Title *</label>
              <input type="text" value={data.title} onChange={e => { update('title', e.target.value); if (!isEdit) update('slug', generateSlug(e.target.value)); }} required className="admin-input" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="admin-label">Category *</label>
                  <select value={data.category} onChange={e => update('category', e.target.value)} className="admin-input">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="admin-label">Date & Time *</label>
                  <input type="datetime-local" value={data.date} onChange={e => update('date', e.target.value)} required className="admin-input [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="admin-label">Venue *</label>
                  <input type="text" value={data.venue} onChange={e => update('venue', e.target.value)} required className="admin-input" />
                </div>
                <div className="space-y-2">
                  <label className="admin-label">City</label>
                  <input type="text" value={data.city} onChange={e => update('city', e.target.value)} className="admin-input" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="admin-label">URL Slug</label>
                <input type="text" value={data.slug} onChange={e => update('slug', e.target.value)} className="admin-input font-mono text-sm" placeholder="auto-generated-from-title" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="admin-card space-y-4">
            <label className="admin-label">Description</label>
            <textarea value={data.description} onChange={e => update('description', e.target.value)} rows={4} className="admin-input resize-none" placeholder="Tell people about this event..." />
          </div>

          {/* Sales Dates */}
          <div className="admin-card space-y-4">
            <p className="admin-label">Sales Window</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[0.6rem] text-muted uppercase">Sales Start</label>
                <input type="datetime-local" value={data.salesStartDate} onChange={e => update('salesStartDate', e.target.value)} className="admin-input [color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <label className="text-[0.6rem] text-muted uppercase">Sales End</label>
                <input type="datetime-local" value={data.salesEndDate} onChange={e => update('salesEndDate', e.target.value)} className="admin-input [color-scheme:dark]" />
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <p className="admin-label">Ticket Tiers</p>
              <button type="button" onClick={addTier} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80">
                <Plus size={14} /> Add Tier
              </button>
            </div>
            
            {data.ticketTiers.map((tier, index) => (
              <div key={tier.tierId} className="p-4 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Tier {index + 1}</span>
                  {data.ticketTiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(index)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[0.55rem] text-muted uppercase mb-1 block">Name</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={e => updateTier(index, 'name', e.target.value)}
                      className="admin-input text-sm"
                      placeholder="e.g. VIP"
                    />
                  </div>
                  <div>
                    <label className="text-[0.55rem] text-muted uppercase mb-1 block">Price (GHS)</label>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={e => updateTier(index, 'price', Number(e.target.value))}
                      className="admin-input text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[0.55rem] text-muted uppercase mb-1 block">Quantity</label>
                    <input
                      type="number"
                      value={tier.quantity}
                      onChange={e => updateTier(index, 'quantity', Number(e.target.value))}
                      className="admin-input text-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-label">Status</p>
                <p className="text-xs text-muted mt-1">
                  {data.status === 'published' ? 'Visible to public' : 'Hidden from public'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => update('status', data.status === 'published' ? 'draft' : 'published')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${data.status === 'published' ? 'bg-green/10 text-green border border-green/20' : 'bg-white/5 text-muted border border-white/10'}`}
              >
                {data.status === 'published' ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Banner Image */}
          <div className="admin-card space-y-4">
            <label className="admin-label">Event Banner</label>
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
          update('coverImage', url);
          setImagePreview(url);
          setImageFile(null);
        }}
        folders={[
          'Astrowave/Events/general',
          'Astrowave/Events/mask-mirage',
        ]}
      />
    </div>
  )
}
