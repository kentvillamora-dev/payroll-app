import { signOut } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPlatformAdmin = false
  let isCompanyAdmin = false

  if (user) {
    const { data: platformAdmin } = await adminClient
      .from('platform_admins')
      .select('id')
      .eq('id', user.id)
      .single()
    isPlatformAdmin = !!platformAdmin

    const { data: userRole } = await adminClient
      .from('user_roles')
      .select('roles(code)')
      .eq('user_id', user.id)
      .single()
    
    isCompanyAdmin = (userRole?.roles as any)?.code === 'ADMIN'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-[family-name:var(--font-geist-sans)] flex flex-col">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Ourus.<span className="text-sky-500 font-black">app</span></span>
            </div>
            
            <div className="flex items-center space-x-4">
              {(isPlatformAdmin || isCompanyAdmin) && (
                <Link 
                  href={isPlatformAdmin ? "/admin" : "/manage"} 
                  className="px-4 py-2 text-sm font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 dark:text-sky-400 rounded-full transition-colors"
                >
                  Return to {isPlatformAdmin ? 'Admin' : 'Manage'} View
                </Link>
              )}
              <form action={signOut}>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col">
        {children}
      </main>
    </div>
  )
}
