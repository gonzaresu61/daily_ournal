'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { todayStr, formatDateShort } from '@/lib/utils'
import { upsertEntry } from '@/lib/api'
import { showToast } from '@/components/ui/Toast'
import type { DiaryEntry, Mood, Weather, DiaryEntryInsert } from '@/types'
import { MOOD_EMOJI, WEATHER_EMOJI, WEATHER_LABEL } from '@/types'

interface FormViewProps {
  entries: DiaryEntry[]
  editingDate: string | null
  calSelectedDate: string | null
  onSaved: (entry: DiaryEntry) => void
  onBack: () => void
}

const MOODS: Mood[] = ['awful', 'bad', 'neutral', 'good', 'excellent']
const WEATHERS: Weather[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']

export function FormView({ entries, editingDate, onSaved, onBack }: FormViewProps) {
  const date = editingDate ?? todayStr()
  const existing = entries.find(e => e.date === date) ?? null
  const isToday = date === todayStr()

  const [moodMorning, setMoodMorning] = useState<Mood | null>(null)
  const [moodAfternoon, setMoodAfternoon] = useState<Mood | null>(null)
  const [moodEvening, setMoodEvening] = useState<Mood | null>(null)
  const [comfort, setComfort] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [breakfast, setBreakfast] = useState('')
  const [lunch, setLunch] = useState('')
  const [dinner, setDinner] = useState('')
  const [note, setNote] = useState('')
  const [weather, setWeather] = useState<Weather>('sunny')
  const [saving, setSaving] = useState(false)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  // Prefill on mount or date change
  useEffect(() => {
    if (existing) {
      setMoodMorning(existing.mood_morning)
      setMoodAfternoon(existing.mood_afternoon)
      setMoodEvening(existing.mood_evening)
      setComfort(existing.comfort_morning || 3)
      setEnergy(existing.energy_level || 3)
      setBreakfast(existing.meal_breakfast || '')
      setLunch(existing.meal_lunch || '')
      setDinner(existing.meal_dinner || '')
      setNote(existing.note || '')
      setWeather((existing.weather as Weather) || 'sunny')
    } else {
      setMoodMorning(null); setMoodAfternoon(null); setMoodEvening(null)
      setComfort(3); setEnergy(3)
      setBreakfast(''); setLunch(''); setDinner('')
      setNote(''); setWeather('sunny')
    }
  }, [date])

  function sliderBg(val: number) {
    const pct = ((val - 1) / 4) * 100
    return `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: DiaryEntryInsert = {
      date,
      mood_morning: moodMorning,
      mood_afternoon: moodAfternoon,
      mood_evening: moodEvening,
      comfort_morning: comfort,
      energy_level: energy,
      meal_breakfast: breakfast.trim(),
      meal_lunch: lunch.trim(),
      meal_dinner: dinner.trim(),
      note: note.trim(),
      weather,
    }
    try {
      const saved = await upsertEntry(payload, existing?.id)
      showToast(isToday ? '✅ 今日の記録を保存しました' : '✅ 記録を保存しました')
      onSaved(saved)
    } catch {
      showToast('⚠️ 保存に失敗しました', '#FF3B30')
    } finally {
      setSaving(false)
    }
  }

  const dateLabel = new Date(date.replace(/-/g, '/')).toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3.5 pb-2 mb-2" style={{ paddingTop: 4 }}>
        <button onClick={onBack} className="icon-btn" style={{ color: 'var(--accent)', borderColor: 'rgba(0,122,255,0.3)', width: 36, height: 36 }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[18px] font-bold flex-1">
          {isToday ? `今日の記録（${dateLabel}）` : `${dateLabel} の記録`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Weather */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🌤</span>
            <span className="text-[15px] font-bold">今日の天気</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WEATHERS.map(w => (
              <button
                key={w} type="button"
                onClick={() => setWeather(w)}
                className="px-3 py-1.5 rounded-full text-[12.5px] cursor-pointer transition-all duration-200"
                style={{
                  border: `1px solid ${weather === w ? 'var(--accent)' : 'var(--glass-border)'}`,
                  background: weather === w ? 'var(--accent-light)' : 'var(--glass-bg)',
                  color: weather === w ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                  boxShadow: weather === w ? '0 0 0 1px var(--accent-glow)' : 'none',
                }}
              >
                {WEATHER_EMOJI[w]} {WEATHER_LABEL[w]}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">😊</span>
            <span className="text-[15px] font-bold">気分の記録</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {([
              { label: '☀️ 朝', val: moodMorning, set: setMoodMorning },
              { label: '🌤 昼', val: moodAfternoon, set: setMoodAfternoon },
              { label: '🌙 夜', val: moodEvening, set: setMoodEvening },
            ] as const).map(({ label, val, set }) => (
              <div key={label}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m} type="button"
                      onClick={() => set(m)}
                      className={`mood-btn${val === m ? ' selected' : ''}`}
                    >
                      {MOOD_EMOJI[m]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🌅</span>
            <span className="text-[15px] font-bold">朝の快適さ / エネルギー</span>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { label: '朝の快適さ', val: comfort, set: setComfort, ticks: ['😩','😔','😐','😊','🤩'] },
              { label: 'エネルギーレベル', val: energy, set: setEnergy, ticks: ['🪫','😴','🙂','💪','⚡'] },
            ] as const).map(({ label, val, set, ticks }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-2.5 text-[13.5px] font-medium">
                  <span>{label}</span>
                  <span className="text-[22px] font-extrabold leading-none" style={{ color: 'var(--accent)' }}>{val}</span>
                </div>
                <input
                  type="range" min={1} max={5} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="custom-slider"
                  style={{ background: sliderBg(val) }}
                />
                <div className="flex justify-between mt-2 text-base px-0.5">
                  {ticks.map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🍽️</span>
            <span className="text-[15px] font-bold">食事の記録</span>
          </div>
          <div className="flex flex-col gap-3">
            {([
              { icon: '🌅', label: '朝食', val: breakfast, set: setBreakfast, ph: 'トースト、コーヒー' },
              { icon: '☀️', label: '昼食', val: lunch, set: setLunch, ph: 'ラーメン、サラダ' },
              { icon: '🌙', label: '夕食', val: dinner, set: setDinner, ph: 'カレー、みそ汁' },
            ] as const).map(({ icon, label, val, set, ph }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-[22px] w-7 text-center flex-shrink-0">{icon}</span>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={`例：${ph}`}
                    className="glass-input"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">📝</span>
            <span className="text-[15px] font-bold">今日のメモ</span>
          </div>
          <textarea
            ref={noteRef}
            value={note}
            onChange={e => {
              setNote(e.target.value)
              const el = noteRef.current
              if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
            }}
            placeholder="今日あったこと、気づいたこと、なんでも..."
            className="glass-textarea"
          />
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full text-base py-4 rounded-2xl mb-2.5"
        >
          {saving ? '保存中…' : existing ? '更新する' : '保存する'}
          {!saving && <Check size={18} />}
        </button>
      </form>
    </>
  )
}
