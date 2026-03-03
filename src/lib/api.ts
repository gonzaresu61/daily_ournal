import { createClient } from '@/lib/supabase/client'
import type { DiaryEntry, DiaryEntryInsert, TrashEntry } from '@/types'

// ---- Diary Entries ----

export async function fetchAllEntries(): Promise<DiaryEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchEntryById(id: string): Promise<DiaryEntry | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function fetchEntryByDate(date: string): Promise<DiaryEntry | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  if (error) return null
  return data
}

export async function upsertEntry(
  entry: DiaryEntryInsert,
  existingId?: string
): Promise<DiaryEntry> {
  const supabase = createClient()

  if (existingId) {
    const { data, error } = await supabase
      .from('diary_entries')
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('diary_entries')
      .insert(entry)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function moveToTrash(entry: DiaryEntry, autoDelete: boolean): Promise<void> {
  const supabase = createClient()

  // ゴミ箱に追加
  const { error: trashError } = await supabase.from('diary_trash').insert({
    original_id: entry.id,
    date: entry.date,
    mood_morning: entry.mood_morning,
    mood_afternoon: entry.mood_afternoon,
    mood_evening: entry.mood_evening,
    comfort_morning: entry.comfort_morning,
    energy_level: entry.energy_level,
    meal_breakfast: entry.meal_breakfast,
    meal_lunch: entry.meal_lunch,
    meal_dinner: entry.meal_dinner,
    note: entry.note,
    weather: entry.weather,
    deleted_at: new Date().toISOString(),
    auto_delete: autoDelete,
  })
  if (trashError) throw trashError

  // 元テーブルから削除
  const { error: deleteError } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', entry.id)
  if (deleteError) throw deleteError
}

// ---- Trash ----

export async function fetchTrash(): Promise<TrashEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diary_trash')
    .select('*')
    .order('deleted_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function restoreFromTrash(trashEntry: TrashEntry): Promise<DiaryEntry> {
  const supabase = createClient()

  // 同日付の既存エントリを確認
  const existing = await fetchEntryByDate(trashEntry.date)

  const payload: DiaryEntryInsert = {
    date: trashEntry.date,
    mood_morning: trashEntry.mood_morning,
    mood_afternoon: trashEntry.mood_afternoon,
    mood_evening: trashEntry.mood_evening,
    comfort_morning: trashEntry.comfort_morning,
    energy_level: trashEntry.energy_level,
    meal_breakfast: trashEntry.meal_breakfast,
    meal_lunch: trashEntry.meal_lunch,
    meal_dinner: trashEntry.meal_dinner,
    note: trashEntry.note,
    weather: trashEntry.weather,
  }

  const restored = await upsertEntry(payload, existing?.id)

  // ゴミ箱から削除
  await supabase.from('diary_trash').delete().eq('id', trashEntry.id)

  return restored
}

export async function permanentDelete(trashId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('diary_trash').delete().eq('id', trashId)
}

export async function emptyTrash(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('diary_trash').delete().eq('user_id', user.id)
}

export async function autoDeleteExpired(trashEntries: TrashEntry[]): Promise<void> {
  const supabase = createClient()
  const now = Date.now()
  const toDelete = trashEntries.filter(e => {
    if (!e.auto_delete) return false
    const diff = now - new Date(e.deleted_at).getTime()
    return diff >= 30 * 24 * 60 * 60 * 1000
  })
  for (const e of toDelete) {
    await supabase.from('diary_trash').delete().eq('id', e.id)
  }
}

// ---- Settings ----

export async function fetchTrashSetting(): Promise<'auto30' | 'manual'> {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'trash_mode')
    .maybeSingle()
  return (data?.value as 'auto30' | 'manual') ?? 'auto30'
}

export async function saveTrashSetting(value: 'auto30' | 'manual'): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('app_settings').upsert(
    { user_id: user.id, key: 'trash_mode', value },
    { onConflict: 'user_id,key' }
  )
}
