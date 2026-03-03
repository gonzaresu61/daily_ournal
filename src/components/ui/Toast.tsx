'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToastState {
  message: string
  color: string
  visible: boolean
}

let toastHandler: ((msg: string, color?: string) => void) | null = null

export function showToast(message: string, color = '#34C759') {
  toastHandler?.(message, color)
}

export function Toast() {
  const [state, setState] = useState<ToastState>({
    message: '',
    color: '#34C759',
    visible: false,
  })

  useEffect(() => {
    toastHandler = (message, color = '#34C759') => {
      setState({ message, color, visible: true })
      setTimeout(() => setState(s => ({ ...s, visible: false })), 2800)
    }
    return () => { toastHandler = null }
  }, [])

  return (
    <div
      className={cn(
        'fixed left-1/2 z-[100] -translate-x-1/2 rounded-full px-5 py-3',
        'text-white text-sm font-semibold whitespace-nowrap pointer-events-none',
        'backdrop-blur-xl border border-white/15',
        'transition-all duration-300',
        state.visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      )}
      style={{
        bottom: 'calc(var(--nav-height) + 20px + var(--safe-bottom))',
        background: 'rgba(30,30,40,0.9)',
        borderColor: state.color + '44',
      }}
    >
      {state.message}
    </div>
  )
}
