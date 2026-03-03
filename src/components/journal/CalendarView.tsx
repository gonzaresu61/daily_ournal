'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { todayStr, formatDateShort } from '@/lib/utils'
import type { DiaryEntry, Mood } from '@/types'
import { MOOD_EMOJI, WEATHER_EMOJI } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  entries: DiaryEntry[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onOpenDetail: (id: string) => void
  onOpenForm: (date: string) => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export function CalendarView({ entries, selectedDate, onSelectDate, onOpenDetail, onOpenForm }: CalendarViewProps) {
  const today = todayStr()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  const entryMap = useMemo(() => {
    const m: Record<string, DiaryEntry> = {}
    entries.forEach(e => { m[e.date] = e })
    return m
  }, [entries])

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const prevLastDate = new Date(year, month, 0).getDate()
    const arr: { day: number; dateStr: string | null; type: 'prev' | 'cur' | 'next' }[] = []

    for (let i = 0; i < firstDay; i++) {
      arr.push({ day: prevLastDate - firstDay + 1 + i, dateStr: null, type: 'prev' })
    }
    for (let d = 1; d <= lastDate; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      arr.push({ day: d, dateStr: ds, type: 'cur' })
    }
    const remain = 42 - arr.length
    for (let d = 1; d <= remain; d++) arr.push({ day: d, dateStr: null, type: 'next' })
    return arr
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
    onSelectDate(today)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
    onSelectDate(today)
  }

  const sel = selectedDate ?? today
  const selEntry = entryMap[sel] ?? null

  return (
    <>
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-3.5 px-0.5">
        <button onClick={prevMonth} className="icon-btn"><ChevronLeft size={18} /></button>
        <h2 className="text-xl font-bold tracking-tight flex-1 text-center">
          {new Date(year, month, 1).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
        </h2>
        <button onClick={nextMonth} className="icon-btn"><ChevronRight size={18} /></button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1.5 px-0.5">
        {WEEKDAYS.map((wd, i) => (
          <span key={wd} className={cn(
            'text-center text-[11px] font-bold py-1 tracking-wide uppercase',
            i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-300' : 'text-white/60'
          )}>{wd}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="glass-card p-2.5 mb-3.5 grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => {
          if (cell.type !== 'cur' || !cell.dateStr) {
            return (
              <div key={idx} className="aspect-square flex items-center justify-center rounded-lg">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{cell.day}</span>
              </div>
            )
          }

          const ds = cell.dateStr
          const entry = entryMap[ds]
          const mood = entry ? (entry.mood_evening ?? entry.mood_afternoon ?? entry.mood_morning) as Mood | null : null
          const isToday = ds === today
          const isSelected = ds === sel
          const isFuture = ds > today
          const dow = new Date(year, month, cell.day).getDay()
          const isSun = dow === 0
          const isSat = dow === 6

          return (
            <button
              key={ds}
              onClick={() => !isFuture && onSelectDate(ds)}
              disabled={isFuture}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg gap-0.5',
                'transition-all duration-200',
                isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                isSelected && !isToday ? 'border' : '',
              )}
              style={{
                background: isSelected ? 'var(--accent-light)' : undefined,
                border: isSelected ? '1.5px solid var(--accent)' : undefined,
                boxShadow: isSelected ? '0 0 0 2px var(--accent-glow)' : undefined,
              }}
            >
              <span
                className={cn(
                  'text-sm leading-none font-medium',
                  isToday
                    ? 'w-[26px] h-[26px] rounded-full flex items-center justify-center font-bold text-white'
                    : isSun ? 'text-red-400' : isSat ? 'text-sky-300' : '',
                )}
                style={isToday ? { background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' } : undefined}
              >
                {cell.day}
              </span>
              {mood && <span className={`cal-mood-dot ${mood}`} />}
              {!mood && entry && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 4px var(--accent-glow)' }} />}
            </button>
          )
        })}
      </div>

      {/* Day Panel */}
      <div className="glass-card p-4 min-h-[80px]">
        {sel > today ? (
          <div>
            <div className="text-sm font-bold mb-1">{formatDateShort(sel)}</div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>まだ先の日付です</p>
          </div>
        ) : !selEntry ? (
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {formatDateShort(sel)}{sel === today ? '（今日）' : ''}
            </span>
            <button
              onClick={() => onOpenForm(sel)}
              className="btn-primary"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              <Plus size={12} /> 記録を追加
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                {formatDateShort(sel)}{sel === today ? '（今日）' : ''}
              </span>
              <div className="flex gap-2">
                <button onClick={() => onOpenForm(sel)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>編集</button>
                <button onClick={() => onOpenDetail(selEntry.id)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>詳細</button>
              </div>
            </div>
            <div className="flex gap-1.5 text-xl">
              {[selEntry.mood_morning, selEntry.mood_afternoon, selEntry.mood_evening]
                .map((m, i) => <span key={i}>{m ? MOOD_EMOJI[m as Mood] : '—'}</span>)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selEntry.weather && (
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'rgba(255,255,255,0.6)' }}>
                  {WEATHER_EMOJI[selEntry.weather as keyof typeof WEATHER_EMOJI]}
                </span>
              )}
              {selEntry.energy_level > 0 && <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'rgba(255,255,255,0.6)' }}>⚡{'⚡'.repeat(selEntry.energy_level - 1)}</span>}
              {selEntry.note && <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'rgba(255,255,255,0.6)' }}>📝 メモ</span>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
