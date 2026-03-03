import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userInfo = {
    id: user!.id,
    email: user!.email ?? '',
    full_name: user!.user_metadata?.full_name ?? null,
    avatar_url: user!.user_metadata?.avatar_url ?? null,
  }

  return <DashboardClient user={userInfo} />
}
