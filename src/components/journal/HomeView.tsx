'use client'

import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  todayStr,
  formatDateFull,
  formatDateCard,
  getGreeting,
  calcStreak,
} from '@/lib/utils'
import { MOOD_EMOJI, MOOD_LABEL, WEATHER_EMOJI, type DiaryEntry } from '@/types'

interface HomeViewProps {
  entries: DiaryEntry[]
  onOpenDetail: (id: string) => void
  onNavigateForm: () => void
}

export function HomeView({ entries, onOpenDetail }: HomeViewProps) {
  const today = todayStr()
  const todayEntry = useMemo(() => entries.find(e => e.date === today) ?? null, [entries, today])
  const recent = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10), [entries])
  const streak = useMemo(() => calcStreak(entries.map(e => e.date)), [entries])

  const moodLatest = todayEntry
    ? (todayEntry.mood_evening ?? todayEntry.mood_afternoon ?? todayEntry.mood_morning)
    : null

  return (
    <>
      {/* Today Banner */}
      <div className="glass-card p-5 mb-4 relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,122,255,0.2) 0%, transparent 70%)' }}
        />
        <div className="text-xs font-medium tracking-wide uppercase mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {formatDateFull(today)}
        </div>
        <div className="text-2xl font-bold tracking-tight mb-4">{getGreeting()}</div>
      </div>

      {/* Stats */}
      <div className="text-xs font-bold tracking-widest uppercase mb-2.5 px-0.5 flex items-center justify-between"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        今日のサマリー
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-8">
        {[
          {
            icon: moodLatest ? MOOD_EMOJI[moodLatest] : '😶',
            label: '今日の気分',
            value: moodLatest ? MOOD_LABEL[moodLatest] : '未記録',
          },
          {
            icon: '🌅',
            label: '朝の快適さ',
            value: todayEntry?.comfort_morning ? '⭐'.repeat(todayEntry.comfort_morning) : '未記録',
          },
          {
            icon: '🍽️',
            label: '食事',
            value: (() => {
              if (!todayEntry) return '未記録'
              const cnt = [todayEntry.meal_breakfast, todayEntry.meal_lunch, todayEntry.meal_dinner].filter(Boolean).length
              return cnt ? `${cnt}食記録済` : '未記録'
            })(),
          },
          {
            icon: '⚡',
            label: 'エネルギー',
            value: todayEntry?.energy_level ? '⚡'.repeat(todayEntry.energy_level) : '未記録',
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="glass-card p-4 flex flex-col gap-1">
            <div className="text-[26px] mb-1">{icon}</div>
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
            <div className="text-[15px] font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* Recent List */}
      <div className="text-xs font-bold tracking-widest uppercase mb-2.5 px-0.5 flex items-center justify-between"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <span>最近の記録</span>
        <span style={{ color: 'var(--warning)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>
          🔥 {streak}日連続
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2.5 py-9 px-5 text-center">
          <div className="text-4xl">📔</div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            まだ記録がありません<br />「記録」から始めましょう！
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recent.map(entry => {
            const { day, weekday } = formatDateCard(entry.date)
            const moods = [entry.mood_morning, entry.mood_afternoon, entry.mood_evening]
              .map(m => m ? MOOD_EMOJI[m] : '—').join(' ')
            const mealCnt = [entry.meal_breakfast, entry.meal_lunch, entry.meal_dinner].filter(Boolean).length
            const meta = [
              entry.weather ? WEATHER_EMOJI[entry.weather as keyof typeof WEATHER_EMOJI] : '',
              mealCnt ? `🍽 ${mealCnt}食` : '',
              entry.note ? '📝 メモあり' : '',
            ].filter(Boolean).join('  ')

            return (
              <button
                key={entry.id}
                onClick={() => onOpenDetail(entry.id)}
                className="glass-card flex items-center gap-3.5 p-4 w-full text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex-shrink-0 text-center w-11">
                  <div className="text-[22px] font-bold leading-none">{day}</div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{weekday}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1 text-lg mb-1">{moods}</div>
                  <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {meta || 'タップして詳細を見る'}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.38)', flexShrink: 0 }} />
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
