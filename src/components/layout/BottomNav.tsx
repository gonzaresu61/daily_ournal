'use client'

import { Home, Calendar, PlusCircle, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavView = 'home' | 'calendar' | 'form' | 'history' | 'trash'

interface BottomNavProps {
  currentView: NavView
  trashCount: number
  onNavigate: (view: NavView) => void
}

const NAV_ITEMS: { view: NavView; label: string; Icon: React.ElementType }[] = [
  { view: 'home', label: 'ホーム', Icon: Home },
  { view: 'calendar', label: 'カレンダー', Icon: Calendar },
  { view: 'form', label: '記録', Icon: PlusCircle },
  { view: 'history', label: '履歴', Icon: Clock },
  { view: 'trash', label: 'ゴミ箱', Icon: Trash2 },
]

export function BottomNav({ currentView, trashCount, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="glass-card flex z-50"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '32px 32px 0 0',
        borderBottom: 'none',
        height: 'calc(var(--nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        paddingTop: '8px',
        maxWidth: '680px',
        margin: '0 auto',
      }}
    >
      {NAV_ITEMS.map(({ view, label, Icon }) => {
        const active = currentView === view
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2.5 relative',
              'text-[10.5px] font-semibold tracking-wide border-none bg-transparent cursor-pointer',
              'transition-all duration-200',
              active ? 'text-[#007AFF]' : 'text-white/38'
            )}
          >
            {/* Active indicator bar */}
            <span
              className={cn(
                'absolute top-1.5 w-7 h-0.5 bg-[#007AFF] rounded-full',
                'transition-all duration-200',
                active ? 'opacity-100' : 'opacity-0'
              )}
            />

            {/* Icon with trash badge */}
            <span className="relative inline-flex">
              <Icon
                size={22}
                strokeWidth={1.8}
                className={cn('transition-transform duration-200', active && 'scale-110')}
              />
              {view === 'trash' && trashCount > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 min-w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--danger)',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                    padding: '0 3px',
                    boxShadow: '0 0 6px rgba(255,59,48,0.5)',
                  }}
                >
                  {trashCount > 99 ? '99+' : trashCount}
                </span>
              )}
            </span>

            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
