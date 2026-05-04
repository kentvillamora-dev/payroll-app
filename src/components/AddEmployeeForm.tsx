'use client'

import { useState } from 'react';
import { inviteEmployee } from '@/app/actions';
interface AddEmployeeFormProps {
  isPlatformAdmin: boolean;
  companies: { id: string, name: string }[];
  roles: { id: string, name: string, code: string }[];
}

export default function AddEmployeeForm({ isPlatformAdmin, companies, roles }: AddEmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await inviteEmployee(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Employee hired! Invitation email has been sent.' });
      (document.getElementById('add-employee-form') as HTMLFormElement)?.reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-full flex items-center justify-center text-xl">
          🤝
        </div>
        <div>
          <h2 className="text-xl font-bold">Hire New Employee</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add details and send a secure invite link.</p>
        </div>
      </div>

      <form id="add-employee-form" action={handleSubmit} className="space-y-6">
        
        {/* Row 0: Company & Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isPlatformAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Target Company</label>
              <select 
                name="company_id"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
              >
                <option value="">Select a company...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Assigned Role</label>
            <select 
              name="role_id"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Employee ID</label>
            <input 
              name="employee_id"
              placeholder="000002" 
              required
              pattern="[0-9]{6}"
              maxLength={6}
              title="Employee ID must be exactly 6 digits"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Personal Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="personal@email.com" 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Row 2: Names */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
            <input 
              name="first_name"
              placeholder="John" 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input 
              name="middle_name"
              placeholder="Q." 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
            <input 
              name="last_name"
              placeholder="Doe" 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Row 3: Suffix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Suffix <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input 
              name="suffix"
              placeholder="Jr., Sr., III" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
          }`}>
            {message.type === 'error' ? (
              <div className="flex flex-col gap-1">
                <span className="font-bold underline text-xs uppercase">Error Trace:</span>
                <span>{message.text}</span>
              </div>
            ) : message.text}
          </div>
        )}

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Invitation...
              </span>
            ) : (
              <span>Send Invitation & Hire</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
