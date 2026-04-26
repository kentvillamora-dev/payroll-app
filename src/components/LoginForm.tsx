'use client'

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/actions';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-sky-500/10 transition-all duration-500 hover:shadow-sky-500/20">
        <div className="space-y-2 mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access the portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
              {error}
            </p>
          </div>
        )}

        <form className="space-y-6" action={login}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Work Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="name@ourus.io" 
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-sky-600 dark:text-slate-500 dark:hover:text-sky-400 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-end px-1 pt-1">
              <a href="#" className="text-xs font-medium text-sky-600 hover:text-sky-500">Forgot password?</a>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 text-base font-bold text-white bg-sky-600 rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-500 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
          >
            Sign In to Dashboard
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New employee? <a href="#" className="font-semibold text-sky-600 hover:text-sky-500">Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}
