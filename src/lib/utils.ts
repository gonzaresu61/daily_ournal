import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日(EEEE)', { locale: ja })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日(E)', { locale: ja })
}

export function formatDateCard(dateStr: string): { day: number; weekday: string } {
  const d = parseISO(dateStr)
  return {
    day: d.getDate(),
    weekday: format(d, 'E', { locale: ja }),
  }
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 10) return 'おはようございます ☀️'
  if (h < 17) return 'こんにちは 🌤'
  return 'こんばんは 🌙'
}

export function calcStreak(dates: string[]): number {
  const dateSet = new Set(dates)
  let streak = 0
  const d = new Date()
  while (true) {
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (dateSet.has(s)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function daysAgo(isoStr: string): number {
  const diff = Date.now() - new Date(isoStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
