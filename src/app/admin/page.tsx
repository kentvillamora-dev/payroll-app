import { signOut } from '@/app/actions';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  
  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 2. Check if Platform Admin
  const { data: platformAdmin } = await adminClient
    .from('platform_admins')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. Fetch Companies (only needed for Platform Admins)
  let companies: any[] = [];
  let roles: any[] = [];

  if (platformAdmin) {
    const { data } = await adminClient
      .from('companies')
      .select('id, name')
      .eq('is_active', true);
    companies = data || [];
    
    // For Platform Admin, we'll fetch roles for the first company as a default 
    // or let the form handle dynamic fetching later. For now, fetch Demo Company roles.
    const { data: roleData } = await adminClient
      .from('roles')
      .select('id, name, code')
      .eq('company_id', '00000000-0000-0000-0000-000000000000')
      .eq('is_active', true);
    roles = roleData || [];
  } else {
    // If Company Admin, get their specific company's roles
    const { data: userData } = await adminClient
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();
    
    if (userData) {
      const { data: roleData } = await adminClient
        .from('roles')
        .select('id, name, code')
        .eq('company_id', userData.company_id)
        .eq('is_active', true);
      roles = roleData || [];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-[family-name:var(--font-geist-sans)]">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Ourus.<span className="text-sky-500 font-black">app</span> Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                {platformAdmin ? 'Platform Admin' : 'Company Admin'}
              </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Overview</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Manage your company's payroll and employee access from one place.</p>
        </div>

        {/* Action Center: Hiring Form */}
        <div className="mb-12">
          <AddEmployeeForm 
            isPlatformAdmin={!!platformAdmin} 
            companies={companies} 
            roles={roles}
          />
        </div>
      </main>
    </div>
  );
}
