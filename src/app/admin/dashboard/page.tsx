'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Zap, Users, Mail, Bell,
  FileText, CalendarCheck,
  Plus, UserPlus, Upload,
  ExternalLink, Star, Clock, 
  BarChart2, Award
} from 'lucide-react'
import {
  getCollection,
  getRecentDocuments,
  getDocumentsSince,
  formatTimestamp,
  countDocuments
} from '@/lib/firebase/helpers'
import { orderBy, where, collection, getDocs, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { Badge } from '@/components/ui/Badge'
import Logo from '@/components/ui/Logo'

interface StatCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
  accentColor: string
  loading: boolean
}

function StatCard({ 
  icon, value, label, 
  accentColor, loading 
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#16161F] border border-[#1E1E2E] rounded-xl p-5 animate-pulse">
        <div className="w-8 h-8 bg-[#1E1E2E] rounded mb-3" />
        <div className="w-16 h-8 bg-[#1E1E2E] rounded mb-2" />
        <div className="w-24 h-3 bg-[#1E1E2E] rounded" />
      </div>
    )
  }

  return (
    <div 
      className="bg-[#0A1A32] border border-[#0F2040] rounded-xl p-5 hover:border-opacity-60 transition-all duration-200 group"
      style={{ borderBottomColor: accentColor, borderBottomWidth: '2px' }}
    >
      <div className="mb-3" style={{ color: accentColor }}>
        {icon}
      </div>
      <p className="font-display text-4xl text-[#F0F8FF] leading-none mb-1">
        {value}
      </p>
      <p className="font-body text-xs tracking-[0.15em] uppercase text-[#6B8CAE]">
        {label}
      </p>
    </div>
  )
}

function RecentTable({
  title,
  items,
  columns,
  viewAllHref,
  loading,
  emptyMessage
}: {
  title: string
  items: any[]
  columns: { 
    key: string
    label: string
    render?: (item: any) => React.ReactNode
  }[]
  viewAllHref: string
  loading: boolean
  emptyMessage: string
}) {
  return (
    <div className="bg-[#0A1A32] border border-[#0F2040] rounded-xl overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-[#0F2040] flex items-center justify-between">
        <h3 className="font-body text-sm font-semibold tracking-[0.1em] uppercase text-[#6B8CAE]">
          {title}
        </h3>
        <Link href={viewAllHref} className="font-body text-xs text-[#00FF87] hover:underline tracking-wider uppercase">
          View All →
        </Link>
      </div>
      {loading ? (
        <div className="p-5 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-[#0F2040] rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-body text-sm text-[#6B8CAE]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0F2040]">
                {columns.map(col => (
                  <th key={col.key} className="px-5 py-3 text-left font-body text-xs font-semibold tracking-[0.15em] uppercase text-[#6B8CAE]">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-3.5 font-body text-sm text-[#F0F8FF]">
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    platformUsers: 0,
    activePlatformEvents: 0,
    pendingBookings: 0,
    avgWaveScore: 0,
    newContacts: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          uCount,
          eCount,
          bCount,
          cCount,
          talentSnap
        ] = await Promise.all([
          countDocuments('users'),
          countDocuments('platform_events'),
          getCollection('bookings', [where('status', '==', 'pending')]),
          getDocumentsSince('contacts', 7).catch(() => []),
          getDocs(collection(db, 'talent_profiles'))
        ])

        const talents = talentSnap.docs.map(d => d.data())
        const avgWS = talents.length > 0 ? talents.reduce((acc, t) => acc + (t.waveScore || 0), 0) / talents.length : 0

        setStats({
          platformUsers: uCount,
          totalEvents: eCount,
          activePlatformEvents: eCount, 
          pendingBookings: bCount.length,
          avgWaveScore: Number(avgWS.toFixed(2)),
          newContacts: cCount.length
        })

        const [events, bookings] = await Promise.all([
           getRecentDocuments('platform_events', 5),
           getRecentDocuments('bookings', 5)
        ])
        setRecentEvents(events)
        setRecentBookings(bookings)

      } catch (error) {
        console.error('Dashboard Load Error:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  const formatTime = (date: Date) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date)

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4 border-b border-[#0F2040] pb-8">
        <div>
          <h1 className="font-display text-4xl text-[#F0F8FF] uppercase">Dashboard</h1>
          <p className="font-body text-sm text-[#6B8CAE] mt-1">Horizon Core Intelligence · System Node Live</p>
        </div>
        <div className="text-right">
          {currentTime && (
            <>
              <p className="font-display text-2xl text-[#00FF87]">{formatTime(currentTime)}</p>
              <p className="font-body text-xs text-[#6B8CAE] mt-0.5">{formatDate(currentTime)}</p>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<Users size={22} />} value={stats.platformUsers} label="Platform Users" accentColor="#38BDF8" loading={loading} />
        <StatCard icon={<CalendarCheck size={22} />} value={stats.activePlatformEvents} label="Active Events" accentColor="#00FF87" loading={loading} />
        <StatCard icon={<Clock size={22} />} value={stats.pendingBookings} label="Pending Gigs" accentColor="#0EA5E9" loading={loading} />
        <StatCard icon={<Star size={22} />} value={stats.avgWaveScore} label="Avg Wave Score" accentColor="#00FF87" loading={loading} />
        <StatCard icon={<Mail size={22} />} value={stats.newContacts} label="New Contacts" accentColor="#0EA5E9" loading={loading} />
        <StatCard icon={<Bell size={22} />} value={stats.totalEvents} label="Event Briefs" accentColor="#38BDF8" loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Platform Analytics', href: '/admin/platform/analytics', icon: <BarChart2 size={20} />, color: '#38BDF8' },
          { label: 'Manage Talent', href: '/admin/platform/talent', icon: <Award size={20} />, color: '#0EA5E9' },
          { label: 'Moderate Content', href: '/admin/platform/ratings', icon: <Star size={20} />, color: '#00FF87' },
          { label: 'System Control', href: '/dev', icon: <Zap size={20} />, color: '#6B8CAE' }
        ].map((action) => (
          <Link key={action.href} href={action.href} className="bg-[#0A1A32] border border-[#0F2040] rounded-xl p-5 flex items-center gap-3 hover:border-opacity-60 hover:bg-[rgba(255,255,255,0.02)] hover:border-[#00FF87] transition-all duration-200 group">
            <span style={{ color: action.color }}>{action.icon}</span>
            <span className="font-body text-sm font-semibold tracking-wider uppercase text-[#6B8CAE] group-hover:text-[#F0F8FF] transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTable
          title="Recent Platform Events"
          items={recentEvents}
          loading={loading}
          viewAllHref="/admin/platform/events"
          emptyMessage="No platform events yet."
          columns={[
            { key: 'title', label: 'Event' },
            { key: 'organizerName', label: 'Host' },
            { key: 'status', label: 'Status', render: (item) => <Badge variant={item.status === 'open' ? 'live' : 'active'}>{item.status}</Badge> }
          ]}
        />
        <RecentTable
          title="Recent Bookings"
          items={recentBookings}
          loading={loading}
          viewAllHref="/admin/platform/bookings"
          emptyMessage="No bookings yet."
          columns={[
            { key: 'eventTitle', label: 'Gig' },
            { key: 'talentStageName', label: 'Artist' },
            { key: 'status', label: 'State', render: (item) => <span className="text-xs uppercase font-bold text-[#00FF87]">{item.status}</span> }
          ]}
        />
      </div>
    </div>
  )
}
