import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center flex-1 px-6 lg:px-8 w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 60H0V0h60v60zM1 59h58V1H1v58z' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        {/* Left Side: Copy and Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>Ourus.app</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl leading-[0.95]">
            Master your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-500">
              payroll flow.
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            A frictionless platform for the modern enterprise. Sign in to manage compensation, tax compliance, and benefits in one unified dashboard.
          </p>

          <div className="hidden lg:grid grid-cols-3 gap-6 pt-8 opacity-50 grayscale border-t border-slate-200 dark:border-slate-800">
             <div className="flex flex-col">
               <span className="text-xl font-bold">99.9%</span>
               <span className="text-[10px] uppercase tracking-widest font-bold">Uptime</span>
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-bold">AES-256</span>
               <span className="text-[10px] uppercase tracking-widest font-bold">Security</span>
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-bold">SOC-2</span>
               <span className="text-[10px] uppercase tracking-widest font-bold">Compliant</span>
             </div>
          </div>
        </div>

        {/* Right Side: The Login Card (Now a Client Component) */}
        <Suspense fallback={<div className="w-full max-w-md h-96 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-3xl" />}>
          <LoginForm />
        </Suspense>

      </div>
    </main>
  );
}
