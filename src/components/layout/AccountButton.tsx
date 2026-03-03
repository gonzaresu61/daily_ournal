'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types'

interface AccountButtonProps {
  user: UserProfile
}

export function AccountButton({ user }: AccountButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="icon-btn"
        title="アカウント"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full" />
        ) : (
          <User size={18} />
        )}
      </button>

      {open && (
        <div
          className="glass-card absolute right-0 top-12 w-56 z-50 overflow-hidden"
          style={{ borderRadius: 16 }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="text-sm font-semibold truncate">{user.full_name || 'ユーザー'}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}
