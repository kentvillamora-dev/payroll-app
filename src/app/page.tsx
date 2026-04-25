import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-3xl space-y-8 text-center animate-in fade-in zoom-in duration-500">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/20 dark:text-blue-400 dark:ring-blue-400/20 bg-blue-50 dark:bg-blue-900/10 mb-4 cursor-default">
          Internal System
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Modernizing your <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Payroll Experience
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 mt-6">
          A secure, fast, and scalable platform to manage employee compensation, benefits, and time tracking. Built for the modern enterprise.
        </p>

        {/* Call to Action */}
        <div className="flex items-center justify-center gap-x-6 pt-8">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 ease-out"
          >
            Sign in to Dashboard
          </Link>
          <a
            href="#"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Request Access <span aria-hidden="true" className="ml-1">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
