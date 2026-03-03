'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import type { DiaryEntry, Mood, Weather } from '@/types'
import { MOOD_EMOJI, WEATHER_EMOJI } from '@/types'

interface HistoryViewProps {
  entries: DiaryEntry[]
  onOpenDetail: (id: string) => void
}

export function HistoryView({ entries, onOpenDetail }: HistoryViewProps) {
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )

  const filtered = useMemo(() => {
    return [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(e => !filterMonth || e.date.startsWith(filterMonth))
  }, [entries, filterMonth])

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3.5 pb-2 mb-2" style={{ paddingTop: 4 }}>
        <h2 className="text-[18px] font-bold flex-1">記録の履歴</h2>
      </div>

      {/* Filter */}
      <div className="glass-card flex items-center gap-2.5 p-3.5 mb-3.5">
        <input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="glass-input flex-1"
          style={{ cursor: 'pointer' }}
        />
        <button onClick={() => setFilterMonth('')} className="btn-secondary" style={{ fontSize: 12, padding: '8px 14px' }}>
          全件
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2.5 py-9 px-5 text-center">
          <div className="text-4xl">📔</div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>記録が見つかりません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(entry => {
            const moods = [entry.mood_morning, entry.mood_afternoon, entry.mood_evening]
              .map(m => m ? MOOD_EMOJI[m as Mood] : '—').join('')
            const tags = [
              entry.weather ? WEATHER_EMOJI[entry.weather as Weather] + ' ' + entry.weather : '',
              [entry.meal_breakfast, entry.meal_lunch, entry.meal_dinner].filter(Boolean).length ? '🍽 食事記録' : '',
              entry.note ? '📝 メモ' : '',
              entry.energy_level ? '⚡'.repeat(entry.energy_level) : '',
            ].filter(Boolean)

            return (
              <button
                key={entry.id}
                onClick={() => onOpenDetail(entry.id)}
                className="glass-card flex flex-col gap-2.5 p-4 w-full text-left transition-all duration-200 hover:scale-[1.005] active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14.5px] font-bold">{formatDateShort(entry.date)}</span>
                  <span className="text-lg">{moods}</span>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[11.5px] px-2.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
