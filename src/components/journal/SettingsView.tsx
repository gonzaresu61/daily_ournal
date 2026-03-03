'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { saveTrashSetting, emptyTrash } from '@/lib/api'
import { showToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface SettingsViewProps {
  trashSetting: 'auto30' | 'manual'
  onBack: () => void
  onSettingChange: (s: 'auto30' | 'manual') => void
  onTrashEmptied: () => void
}

export function SettingsView({ trashSetting, onBack, onSettingChange, onTrashEmptied }: SettingsViewProps) {
  const [showEmptyModal, setShowEmptyModal] = useState(false)

  async function handleSettingChange(val: 'auto30' | 'manual') {
    onSettingChange(val)
    await saveTrashSetting(val)
    showToast(val === 'auto30' ? '⏱ 30日後に自動削除に設定しました' : '🔒 手動削除のみに設定しました')
  }

  async function handleEmptyTrash() {
    await emptyTrash()
    showToast('🗑 ゴミ箱を空にしました', '#FF3B30')
    setShowEmptyModal(false)
    onTrashEmptied()
  }

  const options: { val: 'auto30' | 'manual'; icon: string; title: string; desc: string }[] = [
    {
      val: 'auto30',
      icon: '⏱️',
      title: '30日後に自動削除',
      desc: 'ゴミ箱に入れてから30日後に自動で完全削除されます',
    },
    {
      val: 'manual',
      icon: '🔒',
      title: '手動でのみ削除',
      desc: '自動削除しません。手動で「すべて削除」するまで保持します',
    },
  ]

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3.5 pb-2 mb-2" style={{ paddingTop: 4 }}>
        <button onClick={onBack} className="icon-btn" style={{ color: 'var(--accent)', borderColor: 'rgba(0,122,255,0.3)', width: 36, height: 36 }}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[18px] font-bold flex-1">ゴミ箱の設定</h2>
      </div>

      {/* Auto Delete Options */}
      <div className="glass-card overflow-hidden mb-3.5">
        <div className="text-[11px] font-bold uppercase tracking-widest px-4 pt-3.5 pb-2.5"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          自動削除
        </div>

        {options.map((opt, i) => (
          <div key={opt.val}>
            {i > 0 && <div className="mx-4" style={{ height: 1, background: 'var(--glass-border)' }} />}
            <button
              onClick={() => handleSettingChange(opt.val)}
              className={cn(
                'flex items-center gap-3.5 w-full px-4 py-4 text-left transition-all duration-200',
                trashSetting === opt.val ? 'bg-blue-500/10' : ''
              )}
            >
              <span className="text-[22px] w-7 text-center flex-shrink-0">{opt.icon}</span>
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold mb-0.5">{opt.title}</div>
                <div className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>{opt.desc}</div>
              </div>
              {/* Radio */}
              <div
                className="w-5.5 h-5.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  width: 22,
                  height: 22,
                  border: trashSetting === opt.val ? '2px solid var(--accent)' : '2px solid var(--glass-border)',
                  background: trashSetting === opt.val ? 'var(--accent)' : 'transparent',
                  boxShadow: trashSetting === opt.val ? '0 0 8px var(--accent-glow)' : 'none',
                }}
              >
                {trashSetting === opt.val && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'block' }} />
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="glass-card overflow-hidden mb-3.5">
        <div className="text-[11px] font-bold uppercase tracking-widest px-4 pt-3.5 pb-2.5"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          ゴミ箱の操作
        </div>
        <button
          onClick={() => setShowEmptyModal(true)}
          className="flex items-center gap-2.5 w-full px-4 py-4 text-[14.5px] font-semibold transition-all duration-200 hover:bg-white/8"
          style={{ color: 'var(--danger)' }}
        >
          <span>🗑</span> ゴミ箱を今すぐ空にする
        </button>
      </div>

      <p className="text-xs text-center px-2.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
        ※ 完全に削除された記録は復元できません
      </p>

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
