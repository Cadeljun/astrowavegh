'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Zap, Users, Mail, Bell,
  FileText, CalendarCheck,
  Plus, UserPlus, Upload,
  ExternalLink
} from 'lucide-react'
import {
  getCollection,
  getRecentDocuments,
  getDocumentsSince,
  formatTimestamp
} from '@/lib/firebase/helpers'
import { orderBy, where } from 'firebase/firestore'

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
      <div className="
        bg-[#16161F] border border-[#1E1E2E]
        rounded-xl p-5 animate-pulse">
        <div className="w-8 h-8 
          bg-[#1E1E2E] rounded mb-3" />
        <div className="w-16 h-8 
          bg-[#1E1E2E] rounded mb-2" />
        <div className="w-24 h-3 
          bg-[#1E1E2E] rounded" />
      </div>
    )
  }

  return (
    <div 
      className="
        bg-[#16161F] border border-[#1E1E2E]
        rounded-xl p-5
        hover:border-opacity-60
        transition-all duration-200
        group"
      style={{
        borderBottomColor: accentColor,
        borderBottomWidth: '2px'
      }}
    >
      <div className="mb-3"
        style={{ color: accentColor }}>
        {icon}
      </div>
      <p className="font-display text-4xl 
        text-[#F8F8FF] leading-none mb-1">
        {value}
      </p>
      <p className="font-body text-xs 
        tracking-[0.15em] uppercase 
        text-[#7B7B9A]">
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
    <div className="
      bg-[#16161F] border border-[#1E1E2E]
      rounded-xl overflow-hidden h-full">
      
      {/* Header */}
      <div className="px-5 py-4 
        border-b border-[#1E1E2E]
        flex items-center justify-between">
        <h3 className="font-body text-sm 
          font-semibold tracking-[0.1em] 
          uppercase text-[#7B7B9A]">
          {title}
        </h3>
        <Link href={viewAllHref}
          className="font-body text-xs 
            text-[#FFD166] 
            hover:underline 
            tracking-wider uppercase">
          View All →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-5 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} 
              className="h-10 bg-[#1E1E2E] 
                rounded animate-pulse" 
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-body text-sm 
            text-[#7B7B9A]">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="
                border-b border-[#1E1E2E]">
                {columns.map(col => (
                  <th key={col.key}
                    className="px-5 py-3 
                      text-left font-body 
                      text-xs font-semibold
                      tracking-[0.15em] 
                      uppercase 
                      text-[#7B7B9A]">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i}
                  className="
                    border-b 
                    border-[rgba(255,255,255,0.04)]
                    hover:bg-[rgba(255,255,255,0.02)]
                    transition-colors">
                  {columns.map(col => (
                    <td key={col.key}
                      className="px-5 py-3.5
                        font-body text-sm 
                        text-[#F8F8FF]">
                      {col.render
                        ? col.render(item)
                        : item[col.key] ?? '—'
                      }
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

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalTalent: number
  newContacts: number
  totalWaitlist: number
  totalInquiries: number
}

export default function AdminDashboard() {
  const [stats, setStats] = 
    useState<DashboardStats>({
      totalEvents: 0,
      activeEvents: 0,
      totalTalent: 0,
      newContacts: 0,
      totalWaitlist: 0,
      totalInquiries: 0
    })
  const [statsLoading, setStatsLoading] = 
    useState(true)

  const [recentContacts, setRecentContacts] = 
    useState<any[]>([])
  const [recentInquiries, setRecentInquiries] = 
    useState<any[]>([])
  const [tablesLoading, setTablesLoading] = 
    useState(true)

  const [currentTime, setCurrentTime] = 
    useState<Date | null>(null)

  // Live clock - deferred until mount to prevent hydration error
  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [
          allEvents,
          activeEventsData,
          allTalent,
          recentContactsData,
          allWaitlist,
          allInquiries
        ] = await Promise.all([
          getCollection('events'),
          getCollection('events', [
            where('active', '==', true)
          ]),
          getCollection('talent'),
          getDocumentsSince('contacts', 7).catch(() => []), // fallback if index missing
          getCollection('waitlist'),
          getCollection('talent_inquiries')
        ])

        setStats({
          totalEvents: allEvents.length,
          activeEvents: activeEventsData.length,
          totalTalent: allTalent.length,
          newContacts: recentContactsData.length,
          totalWaitlist: allWaitlist.length,
          totalInquiries: allInquiries.length
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [])

  // Load recent tables
  useEffect(() => {
    async function loadTables() {
      try {
        const [contacts, inquiries] = 
          await Promise.all([
            getRecentDocuments('contacts', 5),
            getRecentDocuments('talent_inquiries', 5)
          ])
        setRecentContacts(contacts)
        setRecentInquiries(inquiries)
      } catch (error) {
        console.error('Error loading recent data:', error)
      } finally {
        setTablesLoading(false)
      }
    }
    loadTables()
  }, [])

  // Format date for display
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)

  return (
    <div className="max-w-7xl mx-auto pb-10">

      {/* Page Header */}
      <div className="flex items-start 
        justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display 
            text-4xl text-[#F8F8FF] uppercase">
            Dashboard
          </h1>
          <p className="font-body text-sm 
            text-[#7B7B9A] mt-1">
            Welcome back, AstroWave Admin
          </p>
        </div>
        <div className="text-right">
          {currentTime && (
            <>
              <p className="font-display text-2xl 
                text-[#FFD166]">
                {formatTime(currentTime)}
              </p>
              <p className="font-body text-xs 
                text-[#7B7B9A] mt-0.5">
                {formatDate(currentTime)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 
        lg:grid-cols-3 xl:grid-cols-6 
        gap-4 mb-8">
        <StatCard
          icon={<Zap size={22} />}
          value={stats.totalEvents}
          label="Total Events"
          accentColor="#FFD166"
          loading={statsLoading}
        />
        <StatCard
          icon={<CalendarCheck size={22} />}
          value={stats.activeEvents}
          label="Active Events"
          accentColor="#06B6D4"
          loading={statsLoading}
        />
        <StatCard
          icon={<Users size={22} />}
          value={stats.totalTalent}
          label="Talent Roster"
          accentColor="#A855F7"
          loading={statsLoading}
        />
        <StatCard
          icon={<Mail size={22} />}
          value={stats.newContacts}
          label="New Contacts"
          accentColor="#FFD166"
          loading={statsLoading}
        />
        <StatCard
          icon={<Bell size={22} />}
          value={stats.totalWaitlist}
          label="Waitlist"
          accentColor="#A855F7"
          loading={statsLoading}
        />
        <StatCard
          icon={<FileText size={22} />}
          value={stats.totalInquiries}
          label="Inquiries"
          accentColor="#06B6D4"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 
        lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Add Event',
            href: '/admin/events/new',
            icon: <Plus size={20} />,
            color: '#FFD166'
          },
          {
            label: 'Add Talent',
            href: '/admin/talent/new',
            icon: <UserPlus size={20} />,
            color: '#A855F7'
          },
          {
            label: 'Upload Media',
            href: '/admin/uploads',
            icon: <Upload size={20} />,
            color: '#06B6D4'
          },
          {
            label: 'View Site',
            href: '/',
            icon: <ExternalLink size={20} />,
            color: '#7B7B9A',
            external: true
          }
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            className="
              bg-[#16161F] 
              border border-[#1E1E2E]
              rounded-xl p-5
              flex items-center gap-3
              hover:border-opacity-60
              hover:bg-[rgba(255,255,255,0.02)]
              hover:border-[#FFD166]
              transition-all duration-200
              group"
          >
            <span style={{ color: action.color }}>
              {action.icon}
            </span>
            <span className="font-body 
              text-sm font-semibold 
              tracking-wider uppercase
              text-[#7B7B9A] 
              group-hover:text-[#F8F8FF]
              transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 
        lg:grid-cols-2 gap-6">
        
        <RecentTable
          title="Recent Contacts"
          items={recentContacts}
          loading={tablesLoading}
          viewAllHref="/admin/contacts"
          emptyMessage="No contacts yet."
          columns={[
            { key: 'name', label: 'Name' },
            {
              key: 'subject',
              label: 'Subject',
              render: (item) => (
                <span className="
                  text-xs text-[#7B7B9A]">
                  {item.subject}
                </span>
              )
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (item) => (
                <span className="
                  text-xs text-[#7B7B9A]">
                  {formatTimestamp(item.createdAt)}
                </span>
              )
            }
          ]}
        />

        <RecentTable
          title="Talent Inquiries"
          items={recentInquiries}
          loading={tablesLoading}
          viewAllHref="/admin/inquiries"
          emptyMessage="No inquiries yet."
          columns={[
            { key: 'name', label: 'Name' },
            {
              key: 'role',
              label: 'Role',
              render: (item) => (
                <span className="
                  text-xs px-2 py-0.5 
                  rounded-full
                  bg-[rgba(168,85,247,0.15)]
                  text-[#A855F7]
                  border border-[rgba(168,85,247,0.3)]">
                  {item.role}
                </span>
              )
            },
            {
              key: 'createdAt',
              label: 'Date',
              render: (item) => (
                <span className="
                  text-xs text-[#7B7B9A]">
                  {formatTimestamp(item.createdAt)}
                </span>
              )
            }
          ]}
        />
      </div>
    </div>
  )
}
