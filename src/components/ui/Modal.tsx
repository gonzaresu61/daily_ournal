'use client'

import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  icon: string
  title: string
  body: string
  cancelLabel?: string
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function Modal({
  open,
  icon,
  title,
  body,
  cancelLabel = 'キャンセル',
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: ModalProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center p-6',
        'backdrop-blur-lg transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className={cn(
          'glass-card w-full max-w-xs p-7 text-center',
          'transition-transform duration-300',
          open ? 'scale-100' : 'scale-90'
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-2">{icon}</div>
        <div className="text-lg font-bold mb-2">{title}</div>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{body}</p>
        <div className="flex gap-2.5 justify-center">
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
