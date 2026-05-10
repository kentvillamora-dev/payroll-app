'use client'

import { useState, useEffect } from 'react'
import { clockIn, clockOut } from '@/app/actions'

export default function TimekeepingWidget({ lastPunch }: { lastPunch: any }) {
  const isClockedIn = lastPunch?.punch_type === 'IN'
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClockedIn && lastPunch?.punched_at) {
      const start = new Date(lastPunch.punched_at).getTime()
      
      // Update immediately
      setElapsed(Math.floor((Date.now() - start) / 1000))
      
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [isClockedIn, lastPunch])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleAction = async () => {
    setLoading(true)
    if (isClockedIn) {
      await clockOut()
    } else {
      await clockIn()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-xl text-center relative overflow-hidden group">
      {/* Dynamic Background gradient for clocked in state */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isClockedIn ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-400/10 to-teal-600/10 blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-center space-x-2">
          {isClockedIn && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
          <span>{isClockedIn ? 'Currently Clocked In' : 'Ready to Work'}</span>
        </div>
        
        <div className="text-7xl sm:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter tabular-nums font-[family-name:var(--font-geist-mono)]">
          {formatTime(elapsed)}
        </div>
        
        <button
          onClick={handleAction}
          disabled={loading}
          className={`w-full max-w-sm mx-auto flex items-center justify-center py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            isClockedIn 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)]' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]'
          } disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>
    </div>
  )
}
