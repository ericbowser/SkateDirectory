import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { parkAdminEnabled } from './config/env';
import AnimatedPageBackground from './components/AnimatedPageBackground';

export default function App() {
  const { pathname } = useLocation();
  const isMapHome = pathname === '/' || pathname === '/map';

  return (
    <div
      className="relative flex h-dvh w-full flex-col overflow-hidden overflow-x-hidden"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      <AnimatedPageBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header
          className="safe-pt z-50 shrink-0 border-b border-slate-800/80 backdrop-blur-md"
          style={{ backgroundColor: 'color-mix(in srgb, var(--page-bg) 82%, transparent)' }}
        >
          <div className="safe-px mx-auto max-w-7xl sm:px-4">
            <div className="flex h-11 items-center justify-between gap-3 sm:h-12">
              <Link to="/" className="min-w-0 flex items-center gap-3">
                <span className="truncate text-base font-semibold text-slate-100 sm:text-lg">
                  <span className="text-amber-400">Skate Directory</span>
                </span>
                <span className="hidden border-l border-slate-700 pl-3 text-xs text-slate-500 lg:block">
                  Find Your Next Session
                </span>
              </Link>
              <nav aria-label="Primary">
                <ul className="flex items-center gap-3 sm:gap-6">
                  <li>
                    <Link
                      to="/"
                      className="inline-flex min-h-10 items-center text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"
                    >
                      Map
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/suggest-park"
                      className="inline-flex min-h-10 items-center text-sm font-medium text-slate-400 transition-colors hover:text-amber-400"
                    >
                      <span className="sm:hidden">Suggest</span>
                      <span className="hidden sm:inline">Suggest a park</span>
                    </Link>
                  </li>
                  {parkAdminEnabled && (
                    <li>
                      <Link
                        to="/skatepark-form"
                        className="inline-flex min-h-10 items-center text-sm font-medium text-slate-500 transition-colors hover:text-amber-400"
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={`mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col safe-px sm:px-4 ${
              isMapHome
                ? 'min-h-0 min-w-0 pb-4 pt-2 sm:pb-8'
                : 'overflow-y-auto overscroll-y-contain pb-6 pt-2 sm:pb-8'
            }`}
          >
            <Outlet />
          </div>
        </main>

        <footer
          className="safe-pb shrink-0 border-t border-slate-700/80 py-2 backdrop-blur-md sm:py-2.5"
          style={{ backgroundColor: 'color-mix(in srgb, var(--page-bg) 82%, transparent)' }}
        >
          <div className="safe-px mx-auto max-w-7xl text-center text-xs text-slate-500 sm:px-4 sm:text-sm">
            <p>&copy; {new Date().getFullYear()} Skate Directory</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
