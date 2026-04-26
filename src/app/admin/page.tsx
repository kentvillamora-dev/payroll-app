import { signOut } from '@/app/actions';
import AddEmployeeForm from '@/components/AddEmployeeForm';

export default function AdminDashboard() {
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
              <span className="text-xl font-bold tracking-tight">Ourus.<span className="text-sky-500 font-black">io</span> Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Employees', value: '0', icon: '👥' },
            { label: 'Pending Approvals', value: '0', icon: '⏳' },
            { label: 'Next Pay Run', value: 'TBD', icon: '📅' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Action Center: Hiring Form */}
        <div className="mb-12">
          <AddEmployeeForm />
        </div>
      </main>
    </div>
  );
}
