import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import TimekeepingWidget from '@/components/TimekeepingWidget'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/')

  // Fetch user profile and company info
  const { data: profile } = await adminClient
    .from('users')
    .select('*, companies(name)')
    .eq('id', user.id)
    .single()

  const companyName = (profile?.companies as any)?.name || 'Unknown Company'

  // Fetch the latest punch record for today/this period
  const { data: lastPunch } = await adminClient
    .from('time_punches')
    .select('*')
    .eq('user_id', user.id)
    .order('punched_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="flex flex-col flex-1 max-w-3xl w-full mx-auto">
      {/* Company Banner */}
      <div className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl p-10 text-white shadow-xl mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl transition-transform duration-1000 group-hover:scale-110 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-start space-y-2">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-sky-50 shadow-sm">
            Assigned Workspace
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{companyName}</h1>
          <p className="mt-2 text-sky-100 text-lg font-medium opacity-90">Welcome back, {profile?.first_name} {profile?.last_name}.</p>
        </div>
      </div>

      {/* Timekeeping Section */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <TimekeepingWidget lastPunch={lastPunch} />
      </div>
    </div>
  )
}
