'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import {
  addDocument,
  updateDocument,
  getDocument
} from '@/lib/firebase/helpers'
import Toast from '@/components/ui/Toast'

interface EventFormProps {
  eventId?: string  // If provided = edit mode
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

const categories = [
  'Parties', 'Concerts', 'Nightlife',
  'Networking', 'Festivals', 'Other'
]

export default function EventForm({ 
  eventId 
}: EventFormProps) {
  const router = useRouter()
  const isEdit = !!eventId
  const [data, setData] = useState<EventData>(defaultData)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const showToast = (
    message: string,
    type: 'success' | 'error'
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load existing event for edit
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
            date: e.date?.toDate
              ? e.date.toDate().toISOString().slice(0,16)
              : e.date || '',
            venue: e.venue || '',
            ticketLink: e.ticketLink || '',
            shortDescription: e.shortDescription || '',
            fullDescription: e.fullDescription || '',
            imageUrl: e.imageUrl || '',
            active: e.active ?? true
          })
          if (e.imageUrl) {
            setImagePreview(e.imageUrl)
          }
        }
      } catch {
        showToast('Failed to load event', 'error')
      } finally {
        setFetchLoading(false)
      }
    }
    loadEvent()
  }, [eventId])

  // Handle image selection
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Upload to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'astrowave_preset')
    formData.append('folder', 'astrowave/events/general')

    setUploadProgress(10)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    setUploadProgress(90)
    const result = await res.json()
    setUploadProgress(100)

    if (!result.secure_url) {
      throw new Error('Upload failed')
    }
    return result.secure_url
  }

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!data.name || !data.venue) {
      showToast('Please fill all required fields', 'error')
      return
    }

    setLoading(true)
    try {
      let imageUrl = data.imageUrl

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const eventData = {
        ...data,
        imageUrl,
        date: data.date ? new Date(data.date) : null
      }

      if (isEdit && eventId) {
        updateDocument('events', eventId, eventData)
        showToast('Event update initiated', 'success')
      } else {
        addDocument('events', eventData)
        showToast('Event creation initiated', 'success')
      }

      setTimeout(() => {
        router.push('/admin/events')
      }, 1500)

    } catch (error) {
      showToast('Failed to initiate save. Check connection.', 'error')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const update = (field: keyof EventData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="flex items-center gap-2 font-body text-sm text-[#7B7B9A] hover:text-[#F8F8FF] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </button>
        <h1 className="font-display text-4xl text-[#F8F8FF] uppercase">
          {isEdit ? 'Edit Event' : 'Add Event'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-[#16161F] border border-[#1E1E2E] rounded-xl p-5">
              <h3 className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-[#7B7B9A] mb-4">
                Event Details
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => update('name', e.target.value)}
                    required
                    placeholder="e.g. Mask Mirage"
                    className="admin-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                      Category *
                    </label>
                    <select
                      value={data.category}
                      onChange={e => update('category', e.target.value)}
                      className="admin-input cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-[#16161F]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={data.date}
                      onChange={e => update('date', e.target.value)}
                      className="admin-input [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={data.venue}
                    onChange={e => update('venue', e.target.value)}
                    required
                    placeholder="e.g. Accra, Ghana"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                    Ticket Link
                  </label>
                  <input
                    type="url"
                    value={data.ticketLink}
                    onChange={e => update('ticketLink', e.target.value)}
                    placeholder="https://..."
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#16161F] border border-[#1E1E2E] rounded-xl p-5">
              <h3 className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-[#7B7B9A] mb-4">
                Descriptions
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A]">
                      Short Description *
                    </label>
                    <span className="font-body text-xs text-[#7B7B9A]">
                      {data.shortDescription.length}/200
                    </span>
                  </div>
                  <textarea
                    value={data.shortDescription}
                    onChange={e => update('shortDescription', e.target.value.slice(0, 200))}
                    rows={3}
                    placeholder="Brief event description shown on cards..."
                    className="admin-input resize-none"
                  />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-[#7B7B9A] block mb-2">
                    Full Description
                  </label>
                  <textarea
                    value={data.fullDescription}
                    onChange={e => update('fullDescription', e.target.value)}
                    rows={5}
                    placeholder="Full event details..."
                    className="admin-input resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-[#16161F] border border-[#1E1E2E] rounded-xl p-5">
              <h3 className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-[#7B7B9A] mb-4">
                Event Image
              </h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#0A0A0F] border-2 border-dashed border-[#1E1E2E] mb-3">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setImageFile(null); update('imageUrl', ''); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Upload size={24} className="text-[#7B7B9A]" />
                    <p className="font-body text-xs text-[#7B7B9A] text-center px-4">Click to upload image</p>
                  </div>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-3">
                  <div className="w-full h-1 bg-[#1E1E2E] rounded-full">
                    <div className="h-full bg-[#FFD166] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-[#1E1E2E] font-body text-sm font-semibold uppercase tracking-wider text-[#7B7B9A] hover:border-[#FFD166] hover:text-[#FFD166] transition-all cursor-pointer">
                <Upload size={14} />
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="bg-[#16161F] border border-[#1E1E2E] rounded-xl p-5">
              <h3 className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-[#7B7B9A] mb-4">Visibility</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-[#F8F8FF]">{data.active ? 'Published' : 'Hidden'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('active', !data.active)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${data.active ? 'bg-[#22c55e]' : 'bg-[#1E1E2E]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 border border-[#FFD166] text-[#FFD166] font-body font-semibold text-sm tracking-widest uppercase rounded-md hover:bg-[#FFD166] hover:text-black transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : (isEdit ? 'Update Event' : 'Create Event')}
              </button>
              <button type="button" onClick={() => router.push('/admin/events')} className="admin-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}