export type Mood = 'excellent' | 'good' | 'neutral' | 'bad' | 'awful'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'

export interface DiaryEntry {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  mood_morning: Mood | null
  mood_afternoon: Mood | null
  mood_evening: Mood | null
  comfort_morning: number // 1-5
  energy_level: number // 1-5
  meal_breakfast: string
  meal_lunch: string
  meal_dinner: string
  note: string
  weather: Weather | null
  created_at: string
  updated_at: string
}

export type DiaryEntryInsert = Omit<DiaryEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface TrashEntry {
  id: string
  user_id: string
  original_id: string
  date: string
  mood_morning: Mood | null
  mood_afternoon: Mood | null
  mood_evening: Mood | null
  comfort_morning: number
  energy_level: number
  meal_breakfast: string
  meal_lunch: string
  meal_dinner: string
  note: string
  weather: Weather | null
  deleted_at: string
  auto_delete: boolean
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export const MOOD_EMOJI: Record<Mood, string> = {
  excellent: '🤩',
  good: '😊',
  neutral: '😐',
  bad: '😔',
  awful: '😫',
}

export const MOOD_LABEL: Record<Mood, string> = {
  excellent: '最高',
  good: '良い',
  neutral: '普通',
  bad: '悪い',
  awful: '最悪',
}

export const WEATHER_EMOJI: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧',
  snowy: '❄️',
  windy: '🌬',
}

export const WEATHER_LABEL: Record<Weather, string> = {
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
  snowy: '雪',
  windy: '風',
}
