'use client'

import { useState } from 'react';
import { createEmployee } from '@/app/actions';

export default function AddEmployeeForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    const result = await createEmployee(formData);
    
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Employee account created successfully!' });
      // Reset form if success
      (document.getElementById('add-employee-form') as HTMLFormElement)?.reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-full flex items-center justify-center text-xl">
          👤
        </div>
        <div>
          <h2 className="text-xl font-bold">Add New Employee</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create credentials for a new staff member.</p>
        </div>
      </div>

      <form id="add-employee-form" action={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              placeholder="employee@ourus.io" 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Temporary Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              required
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
            {message.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>
    </div>
  );
}
