'use client'

import { useState } from 'react'
import { Settings, Trash2 } from 'lucide-react'
import { formatDateShort, daysAgo } from '@/lib/utils'
import { restoreFromTrash, permanentDelete, emptyTrash } from '@/lib/api'
import { showToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import type { TrashEntry, Mood } from '@/types'
import { MOOD_EMOJI } from '@/types'

interface TrashViewProps {
  trash: TrashEntry[]
  trashSetting: 'auto30' | 'manual'
  onRefresh: () => Promise<void>
  onOpenSettings: () => void
  onSettingChange: (s: 'auto30' | 'manual') => void
}

export function TrashView({ trash, trashSetting, onRefresh, onOpenSettings }: TrashViewProps) {
  const [permDeleteTarget, setPermDeleteTarget] = useState<string | null>(null)
  const [showEmptyModal, setShowEmptyModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  const sorted = [...trash].sort((a, b) => b.deleted_at.localeCompare(a.deleted_at))

  async function handleRestore(id: string) {
    const entry = trash.find(e => e.id === id)
    if (!entry) return
    setProcessing(true)
    try {
      await restoreFromTrash(entry)
      showToast('↩ 記録を復元しました')
      await onRefresh()
    } catch {
      showToast('⚠️ 復元に失敗しました', '#FF3B30')
    } finally {
      setProcessing(false)
    }
  }

  async function handlePermDelete() {
    if (!permDeleteTarget) return
    setProcessing(true)
    try {
      await permanentDelete(permDeleteTarget)
      showToast('🗑 完全に削除しました', '#FF3B30')
      await onRefresh()
    } catch {
      showToast('⚠️ 削除に失敗しました', '#FF3B30')
    } finally {
      setProcessing(false)
      setPermDeleteTarget(null)
    }
  }

  async function handleEmptyTrash() {
    setProcessing(true)
    try {
      await emptyTrash()
      showToast('🗑 ゴミ箱を空にしました', '#FF3B30')
      await onRefresh()
    } catch {
      showToast('⚠️ 削除に失敗しました', '#FF3B30')
    } finally {
      setProcessing(false)
      setShowEmptyModal(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3.5 pb-2 mb-2" style={{ paddingTop: 4 }}>
        <h2 className="text-[18px] font-bold flex-1">ゴミ箱</h2>
        <button onClick={onOpenSettings} className="icon-btn"><Settings size={18} /></button>
        <button onClick={() => setShowEmptyModal(true)} className="btn-danger" style={{ fontSize: 12, padding: '7px 14px' }}>
          すべて削除
        </button>
      </div>

      {/* Info bar */}
      <div className="glass-card p-3.5 mb-3.5 flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          ゴミ箱 <strong style={{ color: 'rgba(255,255,255,0.95)' }}>{sorted.length}</strong> 件
        </span>
        {trashSetting === 'auto30' ? (
          <span className="text-[11.5px] px-2.5 py-1 rounded-full"
            style={{ border: '1px solid rgba(255,149,0,0.4)', color: 'var(--warning)', background: 'rgba(255,149,0,0.1)' }}>
            ⏱ 30日で自動削除
          </span>
        ) : (
          <span className="text-[11.5px] px-2.5 py-1 rounded-full"
            style={{ border: '1px solid var(--glass-border)', color: 'rgba(255,255,255,0.6)', background: 'var(--glass-bg)' }}>
            🔒 手動削除のみ
          </span>
        )}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2.5 py-9 px-5 text-center">
          <div className="text-4xl">🗑️</div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>ゴミ箱は空です</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map(e => {
            const days = daysAgo(e.deleted_at)
            const remain = Math.max(0, 30 - days)
            const pct = Math.min(100, (days / 30) * 100)
            const moods = [e.mood_morning, e.mood_afternoon, e.mood_evening]
              .map(m => m ? MOOD_EMOJI[m as Mood] : '—').join('')

            return (
              <div key={e.id} className="glass-card p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold">{formatDateShort(e.date)}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      {days === 0 ? '今日' : `${days}日前`}に削除
                    </div>
                  </div>
                  <div className="text-lg flex-shrink-0">{moods}</div>
                </div>

                {e.auto_delete && (
                  <>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'linear-gradient(to right, var(--danger), var(--warning))' }}
                      />
                    </div>
                    <div className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      あと {remain} 日で自動削除
                    </div>
                  </>
                )}
                {!e.auto_delete && (
                  <div className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>手動削除のみ</div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(e.id)}
                    disabled={processing}
                    className="btn-primary flex-1"
                    style={{ fontSize: 12, padding: '8px 0' }}
                  >
                    ↩ 復元する
                  </button>
                  <button
                    onClick={() => setPermDeleteTarget(e.id)}
                    className="btn-danger"
                    style={{ fontSize: 12, padding: '8px 14px' }}
                  >
                    完全削除
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!permDeleteTarget}
        icon="⚠️"
        title="完全に削除しますか？"
        body="この操作は元に戻せません。"
        confirmLabel="完全削除"
        danger
        onCancel={() => setPermDeleteTarget(null)}
        onConfirm={handlePermDelete}
      />
      <Modal
        open={showEmptyModal}
        icon="🗑️"
        title="ゴミ箱を空にしますか？"
        body="すべての項目が完全に削除されます。この操作は元に戻せません。"
        confirmLabel="空にする"
        danger
        onCancel={() => setShowEmptyModal(false)}
        onConfirm={handleEmptyTrash}
      />
    </>
  )
}
