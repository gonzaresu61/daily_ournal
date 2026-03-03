'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import { moveToTrash, fetchEntryById } from '@/lib/api'
import { showToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import type { DiaryEntry, Mood, Weather } from '@/types'
import { MOOD_EMOJI, MOOD_LABEL, WEATHER_EMOJI } from '@/types'

interface DetailViewProps {
  entryId: string | null
  entries: DiaryEntry[]
  trashSetting: 'auto30' | 'manual'
  onBack: () => void
  onEdit: (date: string) => void
  onDeleted: () => void
}

function Dots({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`dot${i < value ? ' filled' : ''}`} />
      ))}
    </div>
  )
}

export function DetailView({ entryId, entries, trashSetting, onBack, onEdit, onDeleted }: DetailViewProps) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!entryId) return
    const local = entries.find(e => e.id === entryId)
    if (local) {
      setEntry(local)
    } else {
      fetchEntryById(entryId).then(e => setEntry(e))
    }
  }, [entryId, entries])

  async function handleDelete() {
    if (!entry) return
    setDeleting(true)
    try {
      await moveToTrash(entry, trashSetting === 'auto30')
      showToast('🗑 ゴミ箱に移動しました', '#FF9500')
      onDeleted()
    } catch {
      showToast('⚠️ 削除に失敗しました', '#FF3B30')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-white/40 animate-pulse">読み込み中...</p>
      </div>
    )
  }

  const moodRows = [
    { label: '朝', mood: entry.mood_morning },
    { label: '昼', mood: entry.mood_afternoon },
    { label: '夜', mood: entry.mood_evening },
  ]

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3.5 pb-2 mb-2" style={{ paddingTop: 4 }}>
        <button onClick={onBack} className="icon-btn" style={{ color: 'var(--accent)', borderColor: 'rgba(0,122,255,0.3)', width: 36, height: 36 }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[18px] font-bold flex-1">{formatDateShort(entry.date)}</h2>
        <button
          onClick={() => onEdit(entry.date)}
          className="icon-btn"
          style={{ color: 'var(--accent)', borderColor: 'rgba(0,122,255,0.3)' }}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="icon-btn"
          style={{ color: 'var(--danger)', borderColor: 'rgba(255,59,48,0.3)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Mood */}
        <div className="glass-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.6)' }}>気分</div>
          <div className="flex gap-4">
            {moodRows.map(({ label, mood }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                <span className="text-3xl">{mood ? MOOD_EMOJI[mood as Mood] : '—'}</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {mood ? MOOD_LABEL[mood as Mood] : '未記録'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comfort / Energy */}
        <div className="glass-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.6)' }}>快適さ / エネルギー</div>
          <div className="flex gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>朝の快適さ</span>
              <Dots value={entry.comfort_morning ?? 0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>エネルギー</span>
              <Dots value={entry.energy_level ?? 0} />
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="glass-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.6)' }}>食事</div>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: '🌅', label: '朝食', val: entry.meal_breakfast },
              { icon: '☀️', label: '昼食', val: entry.meal_lunch },
              { icon: '🌙', label: '夕食', val: entry.meal_dinner },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-start gap-2.5 text-sm">
                <span className="text-[18px] flex-shrink-0">{icon}</span>
                <div>
                  <div className="text-[11px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
                  <div>{val || '未記録'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        {entry.note && (
          <div className="glass-card p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3.5" style={{ color: 'rgba(255,255,255,0.6)' }}>メモ</div>
            <div className="text-sm leading-7 whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{entry.note}</div>
          </div>
        )}

        {/* Weather */}
        {entry.weather && (
          <div className="glass-card px-5 py-3.5">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>天気：</span>
            <span className="text-[15px]">{WEATHER_EMOJI[entry.weather as Weather]} {entry.weather}</span>
          </div>
        )}
      </div>

      <Modal
        open={showDeleteModal}
        icon="🗑️"
        title="ゴミ箱へ移動しますか？"
        body="ゴミ箱から復元することができます。"
        confirmLabel={deleting ? '移動中...' : '移動する'}
        danger
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
