'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'
import { AccountButton } from '@/components/layout/AccountButton'
import { BottomNav, type NavView } from '@/components/layout/BottomNav'
import { Toast } from '@/components/ui/Toast'
import { HomeView } from '@/components/journal/HomeView'
import { FormView } from '@/components/journal/FormView'
import { CalendarView } from '@/components/journal/CalendarView'
import { HistoryView } from '@/components/journal/HistoryView'
import { DetailView } from '@/components/journal/DetailView'
import { TrashView } from '@/components/journal/TrashView'
import { SettingsView } from '@/components/journal/SettingsView'
import {
  fetchAllEntries,
  fetchTrash,
  fetchTrashSetting,
  autoDeleteExpired,
} from '@/lib/api'
import type { DiaryEntry, TrashEntry, UserProfile } from '@/types'
import { cn } from '@/lib/utils'

type SubView = 'detail' | 'settings' | null

interface DashboardClientProps {
  user: UserProfile
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [currentView, setCurrentView] = useState<NavView>('home')
  const [subView, setSubView] = useState<SubView>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [trash, setTrash] = useState<TrashEntry[]>([])
  const [trashSetting, setTrashSetting] = useState<'auto30' | 'manual'>('auto30')
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [detailBackView, setDetailBackView] = useState<NavView>('home')
  const [calSelectedDate, setCalSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initial load
  useEffect(() => {
    async function init() {
      const [e, t, s] = await Promise.all([
        fetchAllEntries(),
        fetchTrash(),
        fetchTrashSetting(),
      ])
      await autoDeleteExpired(t)
      const freshTrash = await fetchTrash()
      setEntries(e)
      setTrash(freshTrash)
      setTrashSetting(s)
      setLoading(false)
    }
    init()
  }, [])

  const refreshEntries = useCallback(async () => {
    const e = await fetchAllEntries()
    setEntries(e)
  }, [])

  const refreshTrash = useCallback(async () => {
    const t = await fetchTrash()
    setTrash(t)
  }, [])

  function handleNavigate(view: NavView) {
    if (view === 'form') {
      setEditingDate(null)
      setCurrentView('form')
      setSubView(null)
      return
    }
    setCurrentView(view)
    setSubView(null)
  }

  function openDetail(id: string, backView: NavView = 'home') {
    setSelectedEntryId(id)
    setDetailBackView(backView)
    setSubView('detail')
  }

  function openFormForDate(date: string) {
    setEditingDate(date)
    setCurrentView('form')
    setSubView(null)
  }

  if (loading) {
    return (
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBlobs />
        <div className="relative z-10 text-white/60 text-sm animate-pulse">読み込み中...</div>
      </div>
    )
  }

  const isSubViewOpen = subView !== null

  return (
    <div className="relative h-screen overflow-hidden">
      <BackgroundBlobs />

      <div className="relative z-10 flex flex-col h-full w-full overflow-hidden">
        {/* App Header */}
        <header
          className="glass-card flex-shrink-0 z-10"
          style={{ borderRadius: '0 0 32px 32px', borderTop: 'none' }}
        >
          <div className="flex items-center justify-between px-5 pb-3.5 max-w-[680px] mx-auto w-full"
            style={{ paddingTop: 'max(40px, env(safe-area-inset-top, 40px))' }}
          >
            <span className="text-lg opacity-0">✦</span>
            <div className="flex items-center gap-2.5">
              <span className="text-lg" style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 8px rgba(0,122,255,0.35))' }}>✦</span>
              <h1 className="text-[19px] font-bold tracking-tight">Daily Journal</h1>
            </div>
            <AccountButton user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {/* Home */}
          <ViewSlot active={currentView === 'home' && !isSubViewOpen}>
            <HomeView
              entries={entries}
              onOpenDetail={(id) => openDetail(id, 'home')}
              onNavigateForm={() => handleNavigate('form')}
            />
          </ViewSlot>

          {/* Form */}
          <ViewSlot active={currentView === 'form' && !isSubViewOpen}>
            <FormView
              entries={entries}
              editingDate={editingDate}
              calSelectedDate={calSelectedDate}
              onSaved={async (saved) => {
                await refreshEntries()
                if (calSelectedDate && saved.date === calSelectedDate) {
                  setCurrentView('calendar')
                } else {
                  setCurrentView('home')
                }
              }}
              onBack={() => {
                if (calSelectedDate && editingDate === calSelectedDate) {
                  setCurrentView('calendar')
                } else {
                  setCurrentView('home')
                }
              }}
            />
          </ViewSlot>

          {/* Calendar */}
          <ViewSlot active={currentView === 'calendar' && !isSubViewOpen}>
            <CalendarView
              entries={entries}
              selectedDate={calSelectedDate}
              onSelectDate={setCalSelectedDate}
              onOpenDetail={(id) => openDetail(id, 'calendar')}
              onOpenForm={(date) => {
                setCalSelectedDate(date)
                openFormForDate(date)
              }}
            />
          </ViewSlot>

          {/* History */}
          <ViewSlot active={currentView === 'history' && !isSubViewOpen}>
            <HistoryView
              entries={entries}
              onOpenDetail={(id) => openDetail(id, 'history')}
            />
          </ViewSlot>

          {/* Trash */}
          <ViewSlot active={currentView === 'trash' && !isSubViewOpen}>
            <TrashView
              trash={trash}
              trashSetting={trashSetting}
              onRefresh={async () => {
                await Promise.all([refreshEntries(), refreshTrash()])
              }}
              onOpenSettings={() => setSubView('settings')}
              onSettingChange={setTrashSetting}
            />
          </ViewSlot>

          {/* Detail (sub-view overlay) */}
          <ViewSlot active={subView === 'detail'}>
            <DetailView
              entryId={selectedEntryId}
              entries={entries}
              trashSetting={trashSetting}
              onBack={() => setSubView(null)}
              onEdit={(date) => {
                setSubView(null)
                openFormForDate(date)
              }}
              onDeleted={async () => {
                setSubView(null)
                await Promise.all([refreshEntries(), refreshTrash()])
                setCurrentView(detailBackView)
              }}
            />
          </ViewSlot>

          {/* Settings (sub-view overlay) */}
          <ViewSlot active={subView === 'settings'}>
            <SettingsView
              trashSetting={trashSetting}
              onBack={() => setSubView(null)}
              onSettingChange={setTrashSetting}
              onTrashEmptied={async () => {
                setSubView(null)
                await refreshTrash()
                setCurrentView('trash')
              }}
            />
          </ViewSlot>
        </main>

        {/* Bottom Nav */}
        {!isSubViewOpen && (
          <BottomNav
            currentView={currentView}
            trashCount={trash.length}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      <Toast />
    </div>
  )
}

function ViewSlot({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-y-auto overscroll-contain',
        'transition-all duration-280',
        active
          ? 'opacity-100 translate-x-0 pointer-events-auto'
          : 'opacity-0 translate-x-8 pointer-events-none'
      )}
      style={{
        padding: '16px 16px calc(var(--nav-height) + var(--safe-bottom) + 20px)', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </div>
  )
}
