import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center flex-1 px-6 lg:px-8 w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Modern Background Pattern: SVG Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 60H0V0h60v60zM1 59h58V1H1v58z' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        
        {/* Refined Pill Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span>Next-Gen Payroll</span>
        </div>

        {/* High-Impact Typography */}
        <div className="space-y-6">
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-8xl lg:text-[6rem] leading-[0.9] drop-shadow-sm">
            Master your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-500">
              payroll flow.
            </span>
          </h1>
          
          <p className="mx-auto max-w-xl text-lg sm:text-xl leading-relaxed text-slate-500 dark:text-slate-400 font-normal">
            Automate compensation, tax compliance, and benefits with an interface that feels like the future. Fast, secure, and purely intuitive.
          </p>
        </div>

        {/* Premium Action Area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 text-base font-bold text-white bg-sky-600 rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] hover:bg-sky-500 hover:-translate-y-1 transition-all duration-300 focus:ring-4 focus:ring-sky-500/20 active:scale-95"
          >
            Access Portal
          </Link>
          
          <Link
            href="#"
            className="w-full sm:w-auto px-10 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 active:scale-95 shadow-sm"
          >
            Documentation
          </Link>
        </div>

        {/* Sub-hero stats / trust markers (very modern design touch) */}
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 dark:opacity-20 grayscale border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
           <div className="flex flex-col items-center">
             <span className="text-2xl font-bold">99.9%</span>
             <span className="text-[10px] uppercase tracking-widest font-bold">Uptime</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-2xl font-bold">256-bit</span>
             <span className="text-[10px] uppercase tracking-widest font-bold">AES</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-2xl font-bold">SOC-2</span>
             <span className="text-[10px] uppercase tracking-widest font-bold">Compliant</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-2xl font-bold">Instant</span>
             <span className="text-[10px] uppercase tracking-widest font-bold">Settlement</span>
           </div>
        </div>
      </div>
    </main>
  );
}
