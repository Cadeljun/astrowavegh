'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Pencil, 
  Trash2, Eye, EyeOff,
  Calendar, MapPin 
} from 'lucide-react'
import {
  getCollection,
  deleteDocument,
  updateDocument,
  formatTimestamp
} from '@/lib/firebase/helpers'
import { orderBy } from 'firebase/firestore'
import ConfirmModal from 
  '@/components/admin/ConfirmModal'
import { Toast } from '@/components/ui/toast'

interface Event {
  id: string
  name: string
  category: string
  date: any
  venue: string
  imageUrl: string
  active: boolean
  shortDescription: string
  createdAt: any
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filtered, setFiltered] = 
    useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = 
    useState('All')
  const [deleteTarget, setDeleteTarget] = 
    useState<Event | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const categories = [
    'All', 'Parties', 'Concerts', 
    'Nightlife', 'Networking', 'Festivals'
  ]

  // Load events from Firestore
  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await getCollection(
        'events', 
        [orderBy('createdAt', 'desc')]
      )
      setEvents(data as Event[])
    } catch (error) {
      showToast(
        'Failed to load events', 
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [])

  // Filter events
  useEffect(() => {
    let result = [...events]
    if (search) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(
          search.toLowerCase()
        ) ||
        e.venue?.toLowerCase().includes(
          search.toLowerCase()
        )
      )
    }
    if (categoryFilter !== 'All') {
      result = result.filter(e =>
        e.category === categoryFilter
      )
    }
    setFiltered(result)
  }, [events, search, categoryFilter])

  const showToast = (
    message: string, 
    type: 'success' | 'error'
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Toggle active status
  const toggleActive = async (event: Event) => {
    try {
      await updateDocument('events', event.id, {
        active: !event.active
      })
      setEvents(prev => prev.map(e =>
        e.id === event.id 
          ? { ...e, active: !e.active } 
          : e
      ))
      showToast(
        `Event ${!event.active 
          ? 'published' 
          : 'hidden'}`,
        'success'
      )
    } catch {
      showToast('Failed to update event', 'error')
    }
  }

  // Delete event
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDocument(
        'events', 
        deleteTarget.id
      )
      setEvents(prev => 
        prev.filter(e => e.id !== deleteTarget.id)
      )
      showToast('Event deleted', 'success')
    } catch {
      showToast('Failed to delete event', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Format event date
  const formatEventDate = (date: any) => {
    if (!date) return 'TBA'
    try {
      const d = date.toDate 
        ? date.toDate() 
        : new Date(date)
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d)
    } catch { return 'TBA' }
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start 
        justify-between mb-8 
        flex-wrap gap-4">
        <div>
          <h1 className="font-display 
            text-4xl text-[#F8F8FF] uppercase">
            Events
          </h1>
          <p className="font-body text-sm 
            text-[#7B7B9A] mt-1">
            {events.length} total events
          </p>
        </div>
        <Link href="/admin/events/new"
          className="
            flex items-center gap-2
            px-5 py-2.5 rounded-md
            border border-[#FFD166]
            text-[#FFD166]
            font-body text-sm 
            font-semibold tracking-wider 
            uppercase
            hover:bg-[#FFD166] 
            hover:text-black
            hover:shadow-[0_0_20px_rgba(255,209,102,0.3)]
            transition-all duration-200">
          <Plus size={16} />
          Add Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row 
        gap-3 mb-6">
        
        {/* Search */}
        <div className="relative flex-1 
          max-w-sm">
          <Search size={16} 
            className="absolute left-3 
              top-1/2 -translate-y-1/2 
              text-[#7B7B9A]" 
          />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => 
              setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5
              bg-[rgba(255,255,255,0.04)]
              border border-[#1E1E2E]
              rounded-md
              font-body text-sm 
              text-[#F8F8FF]
              placeholder:text-[#7B7B9A]
              outline-none
              focus:border-[#FFD166]
              transition-colors"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => 
            setCategoryFilter(e.target.value)}
          className="px-4 py-2.5
            bg-[rgba(255,255,255,0.04)]
            border border-[#1E1E2E]
            rounded-md
            font-body text-sm 
            text-[#F8F8FF]
            outline-none
            focus:border-[#FFD166]
            transition-colors
            cursor-pointer"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}
              className="bg-[#16161F]">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="
        bg-[#16161F] border border-[#1E1E2E]
        rounded-xl overflow-hidden">
        
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} 
                className="h-16 
                  bg-[#1E1E2E] rounded 
                  animate-pulse" 
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={40} 
              className="mx-auto mb-4 
                text-[#FFD166] opacity-50" 
            />
            <p className="font-body text-sm 
              text-[#7B7B9A]">
              {search || categoryFilter !== 'All'
                ? 'No events match your search.'
                : 'No events yet. Add your first event.'
              }
            </p>
            {!search && categoryFilter === 'All' && (
              <Link href="/admin/events/new"
                className="inline-flex 
                  items-center gap-2 mt-4
                  text-[#FFD166] 
                  font-body text-sm 
                  hover:underline">
                <Plus size={14} />
                Add Event
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block 
              overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="
                    border-b border-[#1E1E2E]">
                    {[
                      'Event', 'Category', 
                      'Date', 'Venue', 
                      'Status', 'Actions'
                    ].map(h => (
                      <th key={h}
                        className="px-5 py-3.5 
                          text-left font-body 
                          text-xs font-semibold
                          tracking-[0.15em] 
                          uppercase 
                          text-[#7B7B9A]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(event => (
                    <tr key={event.id}
                      className="
                        border-b 
                        border-[rgba(255,255,255,0.04)]
                        hover:bg-[rgba(255,255,255,0.02)]
                        transition-colors">
                      
                      {/* Event name + image */}
                      <td className="px-5 py-4">
                        <div className="flex 
                          items-center gap-3">
                          <div className="
                            w-10 h-10 rounded-md
                            bg-[#1E1E2E] 
                            flex-shrink-0
                            overflow-hidden">
                            {event.imageUrl ? (
                              <img
                                src={event.imageUrl}
                                alt={event.name}
                                className="w-full h-full 
                                  object-cover"
                              />
                            ) : (
                              <div className="
                                w-full h-full
                                flex items-center 
                                justify-center">
                                <Calendar size={16}
                                  className="text-[#7B7B9A]"
                                />
                              </div>
                            )}
                          </div>
                          <span className="
                            font-body font-semibold 
                            text-sm text-[#F8F8FF]">
                            {event.name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="
                          font-body text-xs 
                          text-[#7B7B9A]
                          px-2 py-1 rounded
                          bg-[rgba(255,255,255,0.05)]">
                          {event.category || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="
                          font-body text-sm 
                          text-[#7B7B9A]">
                          {formatEventDate(event.date)}
                        </span>
                      </td>

                      {/* Venue */}
                      <td className="px-5 py-4">
                        <span className="
                          font-body text-sm 
                          text-[#7B7B9A]">
                          {event.venue || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`
                          inline-flex items-center 
                          gap-1.5
                          font-body text-xs 
                          px-2.5 py-1 rounded-full
                          ${event.active
                            ? 'bg-[rgba(34,197,94,0.15)] text-green-400 border border-[rgba(34,197,94,0.3)]'
                            : 'bg-[rgba(255,255,255,0.05)] text-[#7B7B9A] border border-[#1E1E2E]'
                          }`}>
                          <span className={`
                            w-1.5 h-1.5 rounded-full
                            ${event.active 
                              ? 'bg-green-400' 
                              : 'bg-[#7B7B9A]'
                            }`} 
                          />
                          {event.active 
                            ? 'Active' 
                            : 'Hidden'
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex 
                          items-center gap-2">
                          <Link
                            href={
                              `/admin/events/${event.id}/edit`
                            }
                            className="
                              p-1.5 rounded
                              text-[#FFD166]
                              hover:bg-[rgba(255,209,102,0.1)]
                              transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => 
                              toggleActive(event)}
                            className="
                              p-1.5 rounded
                              text-[#06B6D4]
                              hover:bg-[rgba(6,182,212,0.1)]
                              transition-colors"
                            title={event.active 
                              ? 'Hide' 
                              : 'Publish'
                            }
                          >
                            {event.active 
                              ? <EyeOff size={15} /> 
                              : <Eye size={15} />
                            }
                          </button>
                          <button
                            onClick={() => 
                              setDeleteTarget(event)}
                            className="
                              p-1.5 rounded
                              text-red-400
                              hover:bg-[rgba(239,68,68,0.1)]
                              transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="lg:hidden 
              divide-y divide-[#1E1E2E]">
              {filtered.map(event => (
                <div key={event.id} 
                  className="p-4">
                  <div className="flex 
                    items-start gap-3 mb-3">
                    <div className="
                      w-12 h-12 rounded-md
                      bg-[#1E1E2E] flex-shrink-0
                      overflow-hidden">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full 
                            object-cover"
                        />
                      ) : (
                        <div className="
                          w-full h-full
                          flex items-center 
                          justify-center">
                          <Calendar size={16}
                            className="text-[#7B7B9A]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 
                      min-w-0">
                      <p className="font-body 
                        font-semibold text-sm 
                        text-[#F8F8FF] 
                        truncate">
                        {event.name}
                      </p>
                      <div className="flex 
                        items-center gap-2 mt-1
                        flex-wrap">
                        <span className="
                          font-body text-xs 
                          text-[#7B7B9A]">
                          {event.category}
                        </span>
                        <span className="
                          text-[#1E1E2E]">
                          •
                        </span>
                        <span className="
                          font-body text-xs 
                          text-[#7B7B9A]">
                          {formatEventDate(
                            event.date
                          )}
                        </span>
                      </div>
                    </div>
                    <span className={`
                      font-body text-xs 
                      px-2 py-0.5 rounded-full
                      flex-shrink-0
                      ${event.active
                        ? 'bg-[rgba(34,197,94,0.15)] text-green-400'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#7B7B9A]'
                      }`}>
                      {event.active 
                        ? 'Active' 
                        : 'Hidden'
                      }
                    </span>
                  </div>
                  <div className="flex 
                    items-center gap-2 
                    justify-end">
                    <Link
                      href={
                        `/admin/events/${event.id}/edit`
                      }
                      className="
                        flex items-center gap-1.5
                        px-3 py-1.5 rounded
                        border border-[#FFD166]
                        text-[#FFD166]
                        font-body text-xs 
                        font-semibold uppercase
                        tracking-wider
                        hover:bg-[rgba(255,209,102,0.1)]
                        transition-colors">
                      <Pencil size={12} />
                      Edit
                    </Link>
                    <button
                      onClick={() => 
                        toggleActive(event)}
                      className="
                        flex items-center gap-1.5
                        px-3 py-1.5 rounded
                        border border-[#06B6D4]
                        text-[#06B6D4]
                        font-body text-xs 
                        font-semibold uppercase
                        tracking-wider
                        hover:bg-[rgba(6,182,212,0.1)]
                        transition-colors">
                      {event.active 
                        ? <><EyeOff size={12} />Hide</>
                        : <><Eye size={12} />Show</>
                      }
                    </button>
                    <button
                      onClick={() => 
                        setDeleteTarget(event)}
                      className="
                        p-1.5 rounded
                        text-red-400
                        hover:bg-[rgba(239,68,68,0.1)]
                        transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Event"
          message={`Are you sure you want to 
            delete "${deleteTarget.name}"? 
            This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
